import { Model, DataType, Sequelize, ModelAttributes, DataTypes, ModelOptions, Op, where} from "sequelize";
import { InstanceNotFoundError } from "./Errors/InstanceNotFoundError.class";
import { InstanceNotBuiltError } from "./Errors/InstanceNotBuiltError.class";
import { InstanceAlreadyBuiltError } from "./Errors/InstanceAlreadyBuiltError.class";

/**
 * The model class is abstract, for some reason variables declared
 * as beeing Models aren't allowed to use some methods because of
 * that. 
 * That is why we create a dummy class for the TS compiler to think
 * that the type is concrete
 */
class ConcreteModel extends Model { };


export abstract class TableClass {
    constructor(...params: any[]) {
        // locking the instance, unlockins is to be done when ready to search for a
        // database entry
        this.lock();
    }

    /**
     * Array mapping the instance keys that need to be saved to their datatype
     */
    static readonly fields : { [index: string] : DataType | typeof TableClass };

    /**
     * An array of strings being the names of the fields to use as a composite primary key
     * this means in the database a combined set of these fields bust have a unique value
     */
    static readonly identifier : string[];




    /**
     * Dynamically generated sequelize database table model
     */
    private static _DatabaseModel : typeof ConcreteModel;
    /**
     * This method does some checks to prevent wrong usages of the class
     * It will check for the proper definitions of static properties but
     * won't be alble to check if the selected [[DataType]] is valid 
     */


    /**
     * Method to dynamically generate the sequelize Model class for a TableClass
     * @param sequelize Sequelize instance for the database connection
     */
    static init_Model( sequelize : Sequelize ) : void {
        console.log(`init the Model ${this.name}`)
        // generating the initilialization params for the table class
        const modelAttributes : ModelAttributes = {
            uuid: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            }
        };
        const modelOptions : ModelOptions = {
            freezeTableName: true,
            indexes: [{
                fields: this.identifier,
                unique: true
            }]
        }
        // iterating on the fields
        const fieldNames : string[] = Object.keys(this.fields);
        fieldNames.forEach((field : string) => {
            // checking if the the field is a primitive database type
            const FieldType = this.fields[field];
            if (!TableClass.isPrototypeOf(FieldType as object)) {
                // adding a field of the right type
                modelAttributes[field] = {type: FieldType as DataType};
                // adds/modify the properties to be stored in the _databaseInstance a getter for this propert
                Object.defineProperty(this.prototype, field, {
                    get: function (this: TableClass) : unknown {
                        if (this._databaseInstance){
                            return this._databaseInstance.get(field)};
                        if (this._prebuild.has(field))
                            return this._prebuild.get(field);
                        return undefined;
                    },
                    set: function(this: TableClass, val : any) : void {
                        if (this._databaseInstance) {
                            // updating the database instance, since the getter gets the value from there it should be synchronously updated
                            this._databaseInstance.set(field, val);
                            // saving the instace in database, this is done asynchronously for performance
                            // lots off save calls will occur but the important is that the alive instance during
                            // runntime will be up to date.
                            if (!this.isLocked()) this._databaseInstance.save();
                            return;
                        }
                        this._prebuild.set(field, val);
                    }
                }); 
            }
            else {
                // we need to wait that the models has been initialized
                // before beeing able to do the associations
                // therefore associations will be done in the
                // init_associations() method that will be called
                // by the Database class once all models have been initialized
                
                // we can still altrady create the fields for the associations that
                // will be defined later, so we can then generate the constraints
                // before initing the associations
                modelAttributes[field] = DataTypes.UUID;

                // preparing the accessessers for the associated instances
                Object.defineProperty(this.prototype, field, {
                    get: function (this: TableClass) : TableClass | undefined {
                        // if the value is cached, return cache
                        if (this._cached_associations.has(field))
                            return this._cached_associations.get(field);
                        // if the instance has beed linked to database,
                        // lookup, cache and return the instance
                        if (this._databaseInstance) {
                            const ParentClass: typeof TableClass = this.constructor as typeof TableClass;
                            const childUUID: string | null = this._databaseInstance.get(field) as string | null;
                            if (!childUUID) return;
                            const ChildClass: typeof ConcreteTableClass = ParentClass.fields[field] as typeof ConcreteTableClass;
                            const val = ChildClass.getByUUID(childUUID);
                            this._cached_associations.set(field, val);
                            return val;
                        }
                        // else return undefined
                        if (this.isLocked()) throw new InstanceNotBuiltError(`Instance has never been built with a database entry`);
                    },
                    set: function(this: TableClass, val : TableClass) : void {
                        
                        let dbVal: string | null = null;
                        if (val && val.uuid) dbVal = val.uuid;
                        
                        // cache the reference of this associated instance for the next time it is read
                        this._cached_associations.set(field, val);
                        // updifing the database instance, since the getter gets the value from there it should be synchronously updated
                        if (!this.isLocked()) {
                            this._databaseInstance.set(field, dbVal);
                            // saving the instace in database, this is done asynchronously for performance
                            // lots off save calls will occur but the important is that the alive instance during
                            // runntime will be up to date.
                            this._databaseInstance.save();
                        }
                    }
                }); 
            }
        });

        this._DatabaseModel = sequelize.define(this.name, modelAttributes, modelOptions);
    }

    static init_associations(): void {
        const fieldNames : string[] = Object.keys(this.fields);
        fieldNames.forEach((field: string): void => {
            // checking if the the field is a primitive database type
            const FieldType = this.fields[field];
            if (TableClass.isPrototypeOf(FieldType as object) && typeof FieldType !== 'string') {
                const AssociatedClass: typeof TableClass = FieldType as any;
                // we know for sure that the instance are concrete during runtime
                const AssociatedModel: typeof ConcreteModel = AssociatedClass.get_Model();
                const CurrentModel : typeof ConcreteModel = this.get_Model();
                AssociatedModel.hasMany(CurrentModel, {
                    foreignKey: field,
                    as: `fk_${field}`,
                    onDelete: 'SET NULL'
                });
                CurrentModel.belongsTo(AssociatedModel, {onDelete: 'SET NULL'});
            }
        });
    }

    static get_Model() : typeof ConcreteModel {
        if (!this._DatabaseModel) throw new Error('The model must be initialized by the Database beforehand');
        return this._DatabaseModel as any;
    } 
    
    /**
     * Broad factory method used to create new instances instead of using the constructor
     * @param fields 
     * @returns A promise that resolves with the created instance
     * @todo Proper typescrpt typing
     */
    // static async create(this: typeof ConcreteTableClass, fields: {[oprtName: string]: any}, ...constructorParams: any[]): Promise<TableClass> {
    //     // getting the list of gotten fields
    //     const gottenfieldNames: string[] = Object.keys(fields);
    //     const validfieldNames: string[] = Object.keys(this.fields)
    //     const constructionData: any = {};
    //     const associatedInstances: {[index:string]:TableClass} = {};
    //     gottenfieldNames.forEach((field:string):void => {
    //         // checking if the gotten field is intended
    //         if (!validfieldNames.includes(field)) throw new Error(`${field} is not a field in the ${this.name} TableClass`);
    //         // checking the expected type for the 
    //         const FieldType = this.fields[field];
    //         if (TableClass.isPrototypeOf(FieldType as object)) {
    //             // awaiting an instance of a class, we need to forward it's UUID
    //             // checking if we got an instance of the right type
    //             if (!(fields[field] instanceof (FieldType as typeof TableClass))) throw new Error(`Gotten instance for the ${field} field was of wrong type`);
    //             // getting the database instance that corresponds
    //             constructionData[field] = (fields[field] as TableClass)._databaseInstance;
    //             associatedInstances[field] = fields[field];
    //         }
    //         else {
    //             // passing the raw data on
    //             constructionData[field] = fields[field];
    //         }
    //     });
    //     // Creating a database instace 
    //     const dbInstance : Model = this._DatabaseModel.build(constructionData);
    //     // saving of the instance is done asynchronously as we already have the data during runtime
    //     dbInstance.save();
    //     // returnining a new instance of this using the instance as data
    //     const newInstance : TableClass = new this(...constructorParams);
    //     // injecting the database instance into the new instance
    //     newInstance.build(dbInstance);
        
    //     return newInstance;
    // }

    /**
     * Factory method to get a saved instance from it's unique uuid
     * @param uuid unique identifier of the instance 
     * @param constructionData extra parameters that may need to be forwarded to the constructor 
     */
    static getByUUID(this: typeof ConcreteTableClass, uuid: string, ...constructionData: any[]): TableClass {
        // building a new dummy instance
        const newInstance: TableClass = new this(...constructionData);
        // injecting the UUID
        newInstance._prebuild.set('uuid', uuid);
         newInstance.unlock()
        return newInstance;
    }

    /**
     * These fields contain the values that we might be using for a lookup
     * in the database during the build process
     */
    public _prebuild: Map<string, unknown> = new Map();

     /**
      * Cached instances of the associated TableClasses
      * They get cached once they are called and looked up for the first time
      */
    public _cached_associations: Map<string, TableClass> = new Map();
    

    public async build(databaseInstance?: Model) {
        // checking if instance is already buit
        if (this._databaseInstance) {
            throw new InstanceAlreadyBuiltError();
        }
        // if the database instance has been passed, build from there
        if (databaseInstance) {
            this._databaseInstance = databaseInstance;
            return this;
        }
        // checking if the uuid has already been defined
        if (this.uuid) {
            const dbData = await (this.constructor as typeof TableClass).get_Model().findByPk(this.uuid);
            if (!(dbData && dbData instanceof Model)) throw new InstanceNotFoundError(`Instance uuid ${this.uuid} not found`);
            this._databaseInstance = dbData;
            return this;
        }
        const ParentClass = (this.constructor as typeof TableClass);
        if (ParentClass.hasIdentifier()) {
            /** @todo checking for defined unique constraints for lookup in database */
            const identifierValue: {[index: string]: any} = {};
            const identifierFields: string[] = (this.constructor as typeof TableClass).identifier;
            identifierFields.forEach((field: string) => {
                // checking the type of that field
                const fieldValue: unknown = (this as any)[field];
                if (typeof(fieldValue) === 'undefined') {
                    // if value is inexistant, look for an empty value
                    identifierValue[field] = null; // (null != unknown for the where close)
                    return; // go to next field
                }; 
                if (fieldValue instanceof TableClass) {
                    // in case of a nested tableclass, forward it's database instance to the identifier value
                    identifierValue[field] = fieldValue._databaseInstance.get('uuid');
                }
                else {
                    // in other cases forward the value dirrectly
                    identifierValue[field] = fieldValue;
                }
            });
            // trying to look up the instance
            const whereClose: any = {where: identifierValue};
            const dbData = await ParentClass.get_Model().findOne(whereClose);
            // check if the instance has been found
            if (dbData) {
                // building from the found db entry
                this._databaseInstance = dbData;
                return this;
            }
            // if not found create a new database entry for this instance
            await this.newBuild();
        }
        return this;
    }

    // 
    /**
     * Method to build a new instance in database acording to the data on the instance
     * @returns 
     */
    private async newBuild(): Promise<void> {
        const ParentClass = (this.constructor as typeof TableClass);
        const thisFields: {[index:string]: any} = {};
        const expectedFields: string[] = Object.keys(ParentClass.fields);
        expectedFields.forEach(field => {
            const fieldVal = (this as any)[field];
            if (fieldVal && fieldVal instanceof TableClass) {
                thisFields[field] = fieldVal._databaseInstance.get('uuid');
                this._cached_associations.set(field, fieldVal);
            }
            else if (fieldVal) {
                thisFields[field] = fieldVal;
            }
            else {
                thisFields[field] = null; // null != undefinied, undefined will used default value
            }
        });
        // building the instance is done synchronously for the programm runtime
        this._databaseInstance = ParentClass.get_Model().build(thisFields);
        // saving it asynchronously, due to that before building, the uniqueness of the constraint needs to be checked
        // uniqueness has already need checked in the method calling 'build' this one
        await this._databaseInstance.save();
        return;
    }
    
    /**
     * Sequelize database instance used to interact with the data
     */
    private _databaseInstance: Model;

    /**
     * Represent the state of lock of an instance
     * if an instance is locked it will provent the instance from interacting
     * with the database.
     * Once the instance gets unlocked it will try to update the database accordingly
     */
    private _lockedState: boolean = false;

    /**
     * Method to lock an instance and provent it from interactions with database.
     * For database lookup lock a new instance, set all the properties of a uniqueness
     * constraint and then unlock the instance to fetch the database data
     */
    public lock() {
        this._lockedState = true;
        return this;
    }

    /**
     * Method to reaload an instance from database
     * the longer an instance is alive the greater the chance of concurency errors,
     * reloading the insance ensures it is fresh from database
     * @returns Promise of the same instance for promise chaning
     */
    public async fetch(): Promise<TableClass> {
        await this._databaseInstance.reload();
        return this;
    }

    /**
     * Unlocks the instance allowing database modifications again and prompting 
     * for a build of this instance if the database instance hasn't been built yet
     * or prompts for a save to database 
     */
    public async unlock() {
        this._lockedState = false;
        if (!this._databaseInstance) await this.build();
        // the save can be done asynchronously as the data is correct at runtime
        else await this._databaseInstance.save();
        return this;
    }

    /**
     * Checks the state of an instance, if it is able to interact with database or not
     * @returns true if the instance is locked, false if not
     */
    public isLocked():boolean {
        return this._lockedState;
    }

    public destroy() {
        return this._databaseInstance.destroy();
    }

    /**
     * The UUID generated by sequelize for an instance
     */
    get uuid() : string | undefined {
        if (this._databaseInstance)
            return this._databaseInstance.get('uuid') as string;
        if (this._prebuild.get('uuid'))
            return this._prebuild.get('uuid') as string;
        return;
    }
    set uuid(val: string | undefined) {
        if (this.isLocked()) this._prebuild.set('uuid', val);
        else this._databaseInstance.set('uuid', val).save();
    }

    /******************************
     * Assertion checks for proper implementation of the class
     ******************************/

    /**
     * Method to check if the class has a defined identifier
     */
    private static hasIdentifier(): boolean {
        return Array.isArray(this.identifier) && this.identifier.length > 0; 
    }

    /**
     * Method to check if the identifier is part of the saved fields
     */
    private static assertIdentifier(): boolean {
        if (!this.hasIdentifier()) return true;
        let res:boolean = true;
        for (let i = 0; res && i < this.identifier.length; i++) {
            res = this.fields.hasOwnProperty(this.identifier[i]);
        }
        return res;
    }
}

class ConcreteTableClass extends TableClass {};
