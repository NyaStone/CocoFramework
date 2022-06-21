import { Model, DataType, Sequelize, ModelAttributes, DataTypes, ModelOptions, Op} from "sequelize";
import { InstanceNotFoundError } from "./Errors/InstanceNotFoundError.class";
import { syncUp } from "../implementations/syncUp.funct";
import { InstanceNotBuiltError } from "./Errors/InstanceNotBuiltError.class";
import { InstanceAlreadyBuiltError } from "./Errors/InstanceAlreadyBuiltError";


/**
 * The model class is abstract, for some reason variables declared
 * as beeing Models aren't allowed to use some methods because of
 * that. 
 * That is why we create a dummy class for the TS compiler to think
 * that the type is concrete
 */
class ConcreteModel extends Model {};

// type of a constructor for typescript to recognize classes
type Class<T> = new (...args: any[]) => T;

export abstract class TableClass {

    constructor(...params: any[]) {}

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
                        if (this._databaseInstance)
                            return this._databaseInstance.get(field);
                        if (this[`_prebuild_${field}`])
                            return this[`_prebuild_${field}`];
                        return null;
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
                        this[`_prebuild_${field}`] = val;
                        if (!this.isLocked()) this.build();
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
                    get: function (this: TableClass) : TableClass | null {
                        if (this._databaseInstance && this[`_cached_association_${field}`]) return this[`_cached_association_${field}`];
                        // if (this._databaseInstance) {
                        //     const ParentClass: typeof TableClass = this.constructor as typeof TableClass;
                        //     const childUUID: string = this._databaseInstance.get(field) as string;
                        //     const ChildType: typeof ConcreteTableClass = ParentClass.fields[field] as typeof ConcreteTableClass;
                        //     this[`_cached_association_${field}`] = ChildType.getByUUID(childUUID);
                        //     return this[`_cached_association_${field}`];
                        // }
                        if (this[`_prebuild_${field}`])
                            return this[`_prebuild_${field}`] as TableClass;
                        return null;
                    },
                    set: function(this: TableClass, val : TableClass) : void {
                        if (this.isLocked()) {
                            this[`_prebuild_${field}`] = val;
                            return;
                        }
                        const associatedDBInstance: Model = val._databaseInstance;
                        // updifing the database instance, since the getter gets the value from there it should be synchronously updated
                        this._databaseInstance.set(field, associatedDBInstance);
                        // cache the reference of this associated instance for the next time it is read
                        this[`_cached_association_${field}`] = val;
                        // saving the instace in database, this is done asynchronously for performance
                        // lots off save calls will occur but the important is that the alive instance during
                        // runntime will be up to date.
                        this._databaseInstance.save();
                    }
                }); 
            }
        });

        this._DatabaseModel = sequelize.define(this.name, modelAttributes, modelOptions);
        console.log(this._DatabaseModel);
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
                    as: field
                });
                CurrentModel.belongsTo(AssociatedModel);
            }
        });
    }

    static get_Model() : typeof ConcreteModel {
        if (!this._DatabaseModel) throw new Error('The model must be initialized by the Database beforehand');
        return this._DatabaseModel as any;
    } 
    
    /**
     * Broad factory method used to create new instances instead of using the 
     * @param fields 
     * @returns A promise that resolves with the created instance
     * @todo Proper typescrpt typing
     */
    static async create(this: typeof ConcreteTableClass, fields: {[oprtName: string]: any}, ...constructorParams: any[]): Promise<TableClass> {
        // getting the list of gotten fields
        const gottenfieldNames: string[] = Object.keys(fields);
        const validfieldNames: string[] = Object.keys(this.fields)
        const constructionData: any = {};
        const associatedInstances: {[index:string]:TableClass} = {};
        gottenfieldNames.forEach((field:string):void => {
            // checking if the gotten field is intended
            if (!validfieldNames.includes(field)) throw new Error(`${field} is not a field in the ${this.name} TableClass`);
            // checking the expected type for the 
            const FieldType = this.fields[field];
            if (TableClass.isPrototypeOf(FieldType as object)) {
                // awaiting an instance of a class, we need to forward it's UUID
                // checking if we got an instance of the right type
                if (!(fields[field] instanceof (FieldType as typeof TableClass))) throw new Error(`Gotten instance for the ${field} field was of wrong type`);
                // getting the database instance that corresponds
                constructionData[field] = (fields[field] as TableClass)._databaseInstance;
                associatedInstances[field] = fields[field];
            }
            else {
                // passing the raw data on
                constructionData[field] = fields[field];
            }
        });
        // Creating a database instace 
        const dbInstance : Model = this._DatabaseModel.build(constructionData);
        // saving of the instance is done asynchronously as we already have the data during runtime
        dbInstance.save();
        // returnining a new instance of this using the instance as data
        const newInstance : TableClass = new this(...constructorParams);
        // injecting the database instance into the new instance
        newInstance.build(dbInstance);
        
        return newInstance;
    }

    /**
     * Factory methof yo get a saved instance from it's unique uuid
     * @param uuid unique identifier of the instance 
     * @param constructionData extra parameters that may need to be forwarded to the constructor 
     * @todo Better error handling using te InstanceNotFoundError class
     */
    static getByUUID(this: typeof ConcreteTableClass, uuid: string, ...constructionData: any[]): TableClass {
        // building a new dummy instance
        const newInstance: TableClass = new this(...constructionData);
        // locking the instance to delay the build sequence after data injection
        newInstance.lock();
        // injecting the UUID and unlock the instance so it can get built
        newInstance._prebuild_uuid = uuid;
        // unlocking the instance to start the build
        newInstance.unlock();

        return newInstance;
    }

    private build(databaseInstance?: Model):void {
        // checking if instance is already buit
        if (this._databaseInstance) {
            throw new InstanceAlreadyBuiltError();
        }
        // if the database instance has been passed, build from there
        if (databaseInstance) {
            this._databaseInstance = databaseInstance;
            return;
        }
        // checking if the uuid has already been defined
        if (this.uuid) {
            const dbData = syncUp((this.constructor as typeof TableClass).get_Model().findByPk(this.uuid));
            if (!(dbData.length > 0 && dbData[0] instanceof Model)) throw new InstanceNotFoundError(`Instance uuid ${this.uuid} not found`);
            this._databaseInstance = dbData[0];
            return;
        }
        const ParentClass = (this.constructor as typeof TableClass);
        if (ParentClass.hasIdentifier()) {
            /** @todo checking for defined unique constraints for lookup in database */
            const identifierValue: {[index: string]: any} = {};
            const identifierFields: string[] = (this.constructor as typeof TableClass).identifier;
            identifierFields.forEach((field: string) => {
                // checking the type of that field
                const fieldValue: unknown = (this as any)[field];
                if (!fieldValue) {
                    // if value is inexistant, look for an empty value
                    identifierValue[field] = null; // (null != unknown for the where close)
                    return; // go to next field
                }; 
                if (fieldValue instanceof TableClass) {
                    // in case of a nested tableclass, forward it's database instance to the identifier value
                    identifierValue[field] = (fieldValue as TableClass)._databaseInstance.get('uuid');
                }
                else {
                    // in other cases forward the value dirrectly
                    identifierValue[field] = fieldValue;
                }
            });
            // trying to look up the instance
            const whereClose: any = {where: identifierValue};
            const dbData = syncUp(ParentClass.get_Model().findOne(whereClose));
            // check if the instance has been found
            if (!(Array.isArray(dbData) && dbData.length > 0 && dbData[0] instanceof Model)) {
                // if not found create a new database entry for this instance
                this.newBuild();
                return;
            }
            // building from the found db entry
            this._databaseInstance = dbData[0];
            return;
        }
        // if neither UUID, Identifier, or passed database instance is present, built a new instance  
        this.newBuild();
        return;
    }

    // 
    /**
     * Method to build a new instance in database acording to the data on the instance
     * @returns 
     */
    private newBuild(): void {
        const ParentClass = (this.constructor as typeof TableClass);
        const thisFields: {[index:string]: any} = {};
        const expectedFields: string[] = Object.keys(ParentClass.fields);
        expectedFields.forEach(field => {
            const fieldVal = (this as any)[field];
            if (fieldVal && fieldVal instanceof TableClass) {
                thisFields[field] = fieldVal._databaseInstance.get('uuid');
                this[`_cached_association_${field}`] = fieldVal;
            }
            else if (fieldVal) {
                thisFields[field] = fieldVal;
            }
            else {
                thisFields[field] = null;
            }
        });
        // building the instance is done synchronously for the programm runtime
        this._databaseInstance = ParentClass.get_Model().build(thisFields);
        // saving it asynchronously, due to that before building the uniqueness of the constraint needs to be checked
        // (done in the more general build method)
        this._databaseInstance.save();
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
    public lock():void {
        this._lockedState = true;
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
    public unlock():void {
        this._lockedState = false;
        if (!this._databaseInstance) this.build();
        // the save can be done asynchronously as the data is correct at runtime
        else this._databaseInstance.save();
    }

    /**
     * Checks the state of an instance, if it is able to interact with database or not
     * @returns true if the instance is locked, false if not
     */
    public isLocked():boolean {
        return this._lockedState;
    }

    /**
     * These fields contain the values that we might be using for a lookup
     * in the database during the build process
     */
    [index:`_prebuild_${string}`]: unknown;

    /**
     * Cached instances of the associated TableClasses
     * They get cached once they are called and looked up for the first time
     */
    [index:`_cached_association_${string}`]: TableClass | null;

    /**
     * The UUID generated by sequelize for an instance
     */
    get uuid() : string | null {
        if (this._databaseInstance)
            return this._databaseInstance.get('uuid') as string;
        if (this._prebuild_uuid)
            return this._prebuild_uuid as string;
        return null;
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
