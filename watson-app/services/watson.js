const axios = require('axios');

//------------------------------------------------------------------------------
// WatsonClient
// Is a helper class to initialize the data that is required for Watson API
// requests at one place and to easily perform functions on it.
// It is used as a singleton (only on instance) in services/service.js.
//
// Usage:
// let watsonClient = new WatsonClient(<appEnv from vcap-local.json>);
// -> initalization of the service is done automatically
// let promise = wastonClient.analyseImage(<url>);
// ...
//------------------------------------------------------------------------------
class WatsonClient {
    constructor(appEnv) {
        this.appEnv = appEnv;
        //default api-address if not provided by appEnv
        this.apiUrl = "https://gateway.watsonplatform.net/visual-recognition/api"
        this.apiKey = null;

        //apiKey equals null indicates that the client wasn't initialized yet
        if(this.apiKey === null){
            this.init(); //executes init function on itself
        }
    }

    //------------------------------------------------------------------------------
    // init()
    // Extracts the necessary watson credentials from appEnv and saves the apiKey
    // and apiUrl in fields of the client instance.
    //------------------------------------------------------------------------------
    init() {
        let appEnv = this.appEnv; //use appEnv from parameter

        //test if appEnv contains the service "watson_vision_combined" or any other watson service using regex
        if (appEnv.services['watson_vision_combined'] || appEnv.getService(/[Ww][Aa][Tt][Ss][Oo][NN]/)) {

            //if the service "watson_vision_combined" is available
            if (appEnv.services['watson_vision_combined']) {
                let credentials = appEnv.services['watson_vision_combined'][0].credentials; //get credentials object for this service
                //if the credentials exist
                if(credentials){
                    //copy apiKey and apiUrl
                    this.apiKey = credentials.apikey;
                    this.apiUrl = credentials.url;
                }else{
                    console.error("No watson credentials provided")
                }
            } else { //if any other service whose name contains "watson" was found
                let credentials = appEnv.getService(/watson/).credentials;
                //if the credentials exist
                if(credentials){
                    //copy apiKey and apiUrl
                    this.apiKey = credentials.apikey;
                    this.apiUrl = credentials.url;
                }else{
                    console.error("No watson credentials provided")
                }
            }

        //if there is no watson service in appEnv
        }else{
            if (process.env.WATSON_API_KEY){
                //get API Key from enviroment variable if available
                this.apiKey = process.env.WATSON_API_KEY;
            }
            if (process.env.WATSON_API_URL){
                //get API Url from enviroment variable if available
                this.apiUrl = process.env.WATSON_API_URL;
            }
        }
        console.log("Successfully initialized watson client!")
    }

    //------------------------------------------------------------------------------
    // anylseImage()
    // Verifies the type of the given parameter, calls simultaneously the
    // /classify and /detect_faces endpoints of the Watson API and combines the
    // data of the responses which is returned as promise.
    //------------------------------------------------------------------------------
    analyseImage(imageUrl) {
        //call the init() function if apiKey is missing
        if(this.apiKey ===  null){
            this.init();I
        }

        //check if necessary parameters are missing or undefined
        if (imageUrl === null || imageUrl === '') {
            console.error("Parameter values must not be null");
            return;
        }

        //------------------------------------------------------------------------------
        // Define the required endpoints (relative paths) of the Watson API:
        //
        // generalEndpoint (/classify):   Returns general information about the image
        //                                like objects, colors and other descriptive 
        //                                classes.
        // facesEndpoint (/detext_faces): Detects faces in the image and returns data
        //                                like age, gender and face_location.
        //------------------------------------------------------------------------------
        let generalEndpoint = `/v3/classify?url=${imageUrl}&version=2018-03-19`
        let facesEndpoint = `/v3/detect_faces?url=${imageUrl}&version=2018-03-19`

        //------------------------------------------------------------------------------
        // Executes both API request simultaneously, spreads the http responses to two
        // variables and combines them as one data object.
        // It returns a promise that can use the data object to execute further functions
        // on it or to catch possible errors.
        //------------------------------------------------------------------------------
        let promise = axios.all([
            this.watsonRequest(generalEndpoint), //request wrapper function
            this.watsonRequest(facesEndpoint)    //request wrapper function
        ]).then(axios.spread((generalRes, facesRes) => {

            // create new object with the data values of both responses
            // -> errors during the request can are catched on the returned
            //    promise
            let data = {general: generalRes.data, faces: facesRes.data}
            return data;

        }));
        return promise;
    }

    //------------------------------------------------------------------------------
    // anylseImage()
    // HTTP Request (GET) wrapper function for the Watson API requests using the
    // relative path from the parameter and the apiKey from the client as authentification.
    // Returns a promise.
    //------------------------------------------------------------------------------
    watsonRequest(relativePath){
        return axios.get(
            `${this.apiUrl}${relativePath}`, 
            {
                //axios uses the auth parameter for basic authentification (username/password)
                auth:{
                    username: 'apikey', //the Watson API uses the API Key as password to the username 'apikey'
                    password: this.apiKey
                }
            }
        )
    }
}

module.exports = WatsonClient;