const uuidv4 = require('uuidv4');

//------------------------------------------------------------------------------
// CloudantClient
// Is a helper class to function as a client for the Cloudant database. It gathers
// the required data and initializes the cloudant instance. Additionally, it
// provides an interface for several database functions.
//
// Usage:
// let cloudantClient = new CloudantClient(<database name>, <appEnv from vcap-local.json>);
// -> initalization of the client is done automatically
// let promise = cloudantClient.get(<id>);
// ...
//------------------------------------------------------------------------------
class CloudantClient {
    constructor(dbName, appEnv) {
        this.dbName = dbName;
        //cloudant and dbInstance are initialized in init()
        this.cloudant = null;
        this.dbInstance = null;
        this.appEnv = appEnv;

        //dbInstance equals null indicates that the client wasn't initialized yet
        if(this.dbInstance === null){
            this.init(); //executes init function on itself
        }
    }

    //------------------------------------------------------------------------------
    // init()
    // Extracts the necessary cloudant credentials from appEnv, creates the database
    // if it doesn't exist and initializes the dbInstance variable.
    //------------------------------------------------------------------------------
    init() {
        let appEnv = this.appEnv; //use appEnv from parameter

        //test if appEnv contains the service "cloudantNoSQLDB" or any other watson service using regex
        if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/[Cc][Ll][Oo][Uu][Dd][Aa][Nn][Tt]/)) {
            const Cloudant = require('@cloudant/cloudant'); //use cloudant libary

            //if the service "cloudantNoSQLDB" is available
            if (appEnv.services['cloudantNoSQLDB']) {
                //initialize the cloudant instance using the credentials
                this.cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
            } else {
                //initialize the cloudant instance using the credentials
                this.cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
            }

        //if there is no cloudant service in appEnv
        }else{
            if (process.env.CLOUDANT_URL){
                this.cloudant = Cloudant(process.env.CLOUDANT_URL); //initialize the cloudant instance from enviroment variable
            }
        }

        //------------------------------------------------------------------------------
        // If cloudant initialization was successful, it tries to create the database
        // with the given name. If this database already exists, it returns an error
        // which is igonored and the database isn't created, else it gets created.
        //------------------------------------------------------------------------------
        if (this.cloudant) {
            //try to create the database with the provided dbName
            this.cloudant.db.create(this.dbName, (err, data) => {
                if(!err) { //if database didn't exist before
                    console.log("Created database: " + this.dbName);
                }
                //if database already exists, ignore error and continue
            });
            this.dbInstance = this.cloudant.db.use(this.dbName); //define database and save as variable
        }
        console.log("Successfully initialized cloudant client!")
    }

    //------------------------------------------------------------------------------
    // multiInsert()
    // Inserts one document and one attachment at the same time.
    //
    // Create new doc: Just provide null as id, a new one is automatically created.
    // Update existing doc: Requires an additional get() before - the returned document
    //                      can be updated and used as "doc" param in this function.
    //
    // Returns a promise.
    //------------------------------------------------------------------------------
    multiInsert(id, file, fileName, mimeType, doc) {
        //call the init() function if dbInstance is missing
        if(this.dbInstance ===  null){
            this.init();
        }

        //check if necessary parameters are missing or undefined
        if (file === null || fileName === null || mimeType === null, doc === null) {
            console.error("Parameter values must not be null");
            return;
        }

        //if id is provided (update)
        if(id){
            let promise = this.dbInstance.multipart.insert(doc, [{name: fileName, data: file, content_type: 'image/' +  mimeType}], id); //use nano/cloudant function
            return promise;
        //if id is not provided (insert)
        }else{
            //creates a new id using uuidv4
            let promise = this.dbInstance.multipart.insert(doc, [{name: fileName, data: file, content_type: 'image/' +  mimeType}], uuidv4()); //use nano/cloudant function
            return promise;
        }
    }

    //------------------------------------------------------------------------------
    // update()
    // Works similar to a simple inser() but with a differnt underlying function to
    // update existing documents by using additionally a id parameter.
    // To do an update, a get() command to retrieve the most recent version of the
    // document is required before.
    //
    // Returns a promise.
    //------------------------------------------------------------------------------
    update(id, doc) {
        //call the init() function if dbInstance is missing
        if(this.dbInstance ===  null){
            this.init();
        }

        //check if necessary parameters are missing or undefined
        if (id === null || doc === null) {
            console.error("Parameter values must not be null");
            return;
        }

        //use nano/cloudant function to update document
        let promise = this.dbInstance.insert(doc, id);
        return promise;
    }

    //------------------------------------------------------------------------------
    // getAttachmentAsStream()
    // Returns an attachment as a file stream using the connected document id and
    // the file name. It does not return any meta data of the file.
    //
    // Returns a promise.
    //------------------------------------------------------------------------------
    getAttachmentAsStream(id, fileName) {
        //call the init() function if dbInstance is missing
        if(this.dbInstance ===  null){
            this.init();
        }

        //check if necessary parameters are missing or undefined
        if (id === null || fileName === null) {
            console.error("Parameter values must not be null");
            return;
        }

        //use nano/cloudant function to get attachment
        let stream = this.dbInstance.attachment.getAsStream(id, fileName);
        return stream;
    }

    //------------------------------------------------------------------------------
    // getAll()
    // Lists all documents of the database as array without any filter.
    // Documents are returned as json and include besides default fields and custom
    // fields also the meta data of the connected attachments.
    //
    // Returns a promise.
    //------------------------------------------------------------------------------
    getAll() {
        //call the init() function if dbInstance is missing
        if(this.dbInstance ===  null){
            this.init()
        }

        //use nano/cloudant function to list documents/rows
        let promise = this.dbInstance.list({ include_docs: true });
        return promise;
    }

    //------------------------------------------------------------------------------
    // get()
    // Gets a single document using its id.
    // The Documents are returned as json and include besides default fields and custom
    // fields also the meta data of the connected attachments.
    //
    // Returns a promise.
    //------------------------------------------------------------------------------
    get(id) {
        //call the init() function if dbInstance is missing
        if(this.dbInstance ===  null){
            this.init()
        }

        //check if necessary parameters are missing or undefined
        if (id === null) {
            console.error("Parameter values must not be null");
            return;
        }

        //use nano/cloudant function to find and get the document
        let promise = this.dbInstance.get(id);
        return promise;
    }
}

module.exports = CloudantClient;