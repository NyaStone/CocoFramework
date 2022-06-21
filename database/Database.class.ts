import fs from 'fs';
import { Sequelize, SyncOptions } from 'sequelize';

import { TableClass } from './TableClass.class';
import * as config from '../config.json';

/**
 * Class representing the database, singleton instance
 */
export class Database {
    /**
     * Singleton instance of the database
     */
    private static _singleton : Database;

    private _table_classes : (typeof TableClass)[];
    private _sequelize : Sequelize;

    /**
     * This constructor is private, it is where the whole Sequelize database setup
     * will happen.
     * It is part of the start of the execution process of the whole framework, and thus should not 
     * be called outside of init(). 
     */
    private constructor(  ) {
        /** @todo choose database setup for sequelize ORM */
        this._sequelize = new Sequelize(config.database.databasename, config.database.username, config.database.password, {
            host: config.database.address,
            port: config.database.port,
            dialect: 'mysql'
        }); 

        this._table_classes = [];
    }

    /**
     * This function is the start of the whole database setup for this framework.
     * 
     * This function needs to be called once before anything database related within
     * the main file located at the root of the node project.
     * (if not, an error will be called as soon as database related methods are called)
     * If you don't follow this adivce, be carefull with async function that might call 
     * the database before init.
     * 
     * This function reads the whole directory for classes that implement the 
     * data models classes and call their hidden init methods to setup the sequelize
     * model within the singleton instance of this class
     * @param project_path Path of the node project (usually __dirname if the main file is located in the root directory) 
     */
    static init( project_path : string ) : void {
        // bail if the singleton instance has already been created
        if (this._singleton) return;
        // instantiating the singleton instance
        this._singleton = new this();
        // recursively looking though the project to import classes and add their table schemes to the model
        this._singleton.rescursive_import_classes(project_path);
        // initializing all the models for the imported classes
        this._singleton._table_classes.forEach((tableClass : typeof TableClass) : void => {
            tableClass.init_Model(this._singleton._sequelize);
        });
        // Creating the table associations once all models are created
        this._singleton._table_classes.forEach((tableClass : typeof TableClass) : void => {
            tableClass.init_associations();
        });
    }

    private rescursive_import_classes( path : string ) : void {
        // looking through the directory
        const path_content : fs.Dirent[] = fs.readdirSync( path, {withFileTypes: true});
        path_content.forEach((ellement : fs.Dirent) => {
            // if the ellement is a file that contains a js class 
            if (ellement.isFile() && ellement.name.endsWith('.class.js') && ellement.name !== 'TableClass.class.ts') {
                // importing the class
                const imports : any = require(`${path}/${ellement.name}`);
                const importKeys : string[] = Object.keys(imports);
                importKeys.forEach(importedClassName => {
                    const The_class : Function = imports[importedClassName];
                    // check if the class is extending TableClass
                    if (TableClass.isPrototypeOf(The_class)) {
                        // adding the class to the private table class list, the class needs to be typecasted because ts doesn't narrow on it's own
                        this._table_classes.push(The_class as (typeof TableClass));
                        console.log(`Imported ${The_class.name}`);
                    }
                });
            }
            // if the ellement is a directory
            else if (ellement.isDirectory()) {
                // recursively search in that directory
                this.rescursive_import_classes( `${path}/${ellement.name}`);
            }
        })
    }

    /**
     * Method used to get the singleton instance of this class.
     * @returns {Database} database instance
     */
    static get_instance() : Database {
        // if the singleton instance hasn't been instantiated yet, do it.
        if (!this._singleton) throw new Error('Database must be init before getting an instance.');
        // return the instance
        return this._singleton;
    } 
    

    sync(options?: SyncOptions):Promise<Sequelize> {
        return this._sequelize.sync(options);
    }
}