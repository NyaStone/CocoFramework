/**
 * Class representing the database, singleton instance
 */
 module.exports = class Database {
    /**
     * @type {Database} - Singleton instance of the database
     * @private
     */
    static __singleton;

    /**
     * This constructor is private, it is where the whole Sequelize database setup
     * will happen.
     * It is part of the start of the execution process of the whole framework, and thus should not 
     * be called outside of get_instance(). 
     * @private
     */
    constructor(  ) {



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
     * @param {string} project_path Path of the node project (usually __dirname if the main file is located in the root directory) 
     */
    static init( project_path ) {

    }

    /**
     * Method used to get the singleton instance of this class.
     * @returns {Database} database instance
     */
    static get_instance() {
        // if the singleton instance hasn't been instantiated yet, do it.
        if (!Database.__singleton) throw new Error('Database must be init before getting an instance.');
        // return the instance
        return Database.__singleton;
    } 
    
}