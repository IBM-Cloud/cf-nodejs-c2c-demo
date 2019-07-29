# Node.js IBM Cloud Foundry Demo

## Description

This project is a demonstration for Node.js Microservices and Container-to-Container networking on IBM Cloud Foundry. It involves two distrinct microservices in combination with a Cloudant NoSQL database and the Watson Visual Recognition API which provide a simple 'Guestbook' functionality to the user. In order to demonstrate the concept of Container-to-Container networking, the second microservice which connects to the Watson API is not required for the basic functionality of the application (add a guest, show all guests) and can be added sperately afterwards. This helps to show that both microservices/CF applications communicate with each other and that the second service only needs an internal route due to the configurated networking policy.

## Architecture

![architecture](.docs/architecture.png)

1. The frontend/interface for the user is served by the 'main-service' (left Node.js application)
2. Backend API calls to create a new guestbook entry and to retrieve entries and images
3. Save/Retrieve entries in/from the connected Cloudant database
4. API Request from 'main-service' to 'watson-service' to analyse the previously saved image
5. Use Waston Visual Recognition API to analyse the image using the provided image URL and create tags from this data
6. Retrieve the image stream from the Cloudant Blob store by using the previously (in step 3) created URL

## Contents

This repository includes both microservices/Node.js applications, the 'main-service' and the 'watson-service' which are saved in the same called sub-directories. Hereby, the 'main-service' is responsible for the basic functionality of the guestbook (HTML, create, list, database connection) while the 'watson-service' is optional and handles the connection with the Watson Visual Recognition API and their results. Both applications are full Node.js REST APIs and their root folders include a README.md file with more information about their functionality.

## Deployment

### Prerequisites

- Install latest version of IBM Cloud CLI: https://cloud.ibm.com/docs/cli?topic=cloud-cli-getting-started
- If not present, create Account on IBM Cloud: https://cloud.ibm.com/registration
- Login into your Cloud Foundry organization and space: https://cloud.ibm.com/docs/cli?topic=cloud-cli-getting-started#step3-configure-idt-env
- Latest version of GitHub: https://git-scm.com/downloads
- Latest version of Node.js for running the server locally: https://nodejs.org/en/download/
- code editior/IDE of your choice (VS CODE, Atom, Sublime...)

### Local setup

1. open a terminal at the location of your choice
2. clone Github Project using `git clone https://github.com/m-lukas/cf-nodejs-c2c-demo.git`
3. use command `cd cf-nodejs-c2c-demo` to access the project folder
4. open the project in the code editior/IDE of your choice

### Main-App

1. First of all, go to the "Compute" section in the IBM Cloud catalog by clicking on the navigation item "Catalog" on the IBM Cloud Dashboard and subsequently on the menu item "Compute" or by opening the following link: https://cloud.ibm.com/catalog?search=label:lite&category=compute
2. In the list, search for the "SDK for Node.js" product card and click on it in order to create a new Cloud Foundry (CF) App based on the Node.js buildpack.
3. Fill out the form for the app creation:

  - *App name* - To keep it simple, we will use the name "guestbook-main" for this application. However you are free to use any other name but consider to change the name in all subsequent steps.
  - *Host name* - Choose a unique host name for your URL to be accessed by its users. This must not equal the app name.
  - *Domain* -  Leave it on the default value.
  - *Region/Location*, *Organization* and *Space* - In the Lite version, use the region London for deployment. If organization and space fields don't have any values, you have to create a new Cloud Foundry (CF) organization and space before: https://cloud.ibm.com/docs/account?topic=account-orgsspacesusers
  - *Tags* - Add the tag "guestbook" to find your resources more easily.
  - *Pricing Plans* - Select your prefered pricing plan and memory. The Lite plan and 128MB of memory are sufficient.

4. Following, click on the button "Create" to submit the form and create the app.

- You have been redirected to an application overview and the app was created. Please wait until the app is started/awake. The status can be found in the header, near to the application name.
- Additionally, by clicking on the "Routes" button and subsequently, on the public URL in the list, you can check the status of the app directly. Afterwards, go back to the IBM Cloud website.

5. Go again to the "Catalog" by clicking on the same named navigation item but this time go to the "Databases" section or open the following link: https://cloud.ibm.com/catalog?search=label:lite&category=databases
6. Search for the product card "Cloudant" and click on it, to create a new Cloudant NoSQL database.
7. Fill out the form for the database creation:

- *Service name* - To keep it simple, we will use the name "guestbook-database" for this service but you can use any other name for it as well.
- *Region/Location* - To reduce latency, use the same region/location as for the CF application.
- *Tags* - Add the tag "guestbook" to find your resources more easily.
- *Authentication Methods* - Select the authentification method: "Use both legacy credentials and IAM" to enable HTTP authentification which is needed to send the requests to the database.
- *Pricing Plans* - Select your prefered pricing plan and memory. The Lite plan is sufficient for our needs.

8. Click on the button "Create" to submit the form and create the database.

- You're redirected to the service overview.

9. In the side bar, click on the item "Connections".
10. Subsequently on the connections page, click the button "Create connection" to create a new connection configuration between the application and the service.
11. After selecting the region/location of the previously created application in the filter of the table, you will see the application "guestbook-main" as entry in the table.
12. Hover over the "guestbook-main" row to find the "Create" button and click on it.
13. In the form for creating the connection, you can stay with the default values. The "Access Role" should be "Manager". Following, click on "Connect & restage app".
14. You have to confirm the restaging of the "guestbook-main" application in another popup.
15. In the table, under "Connected Applications", you will find "guestbook-main" as entry. Click on the "guestbook-main" row to go to the application dashboard.

#### Local Testing (optional)

Local Testing is only necessary if you consider to modify the application code. In this case, you can very quickly restart the application and debug it more easily. In opposite to the second application of our example, the main-app ("guestbook-main") does not require the second application to work. If the second application ("guestbook-watson") is not available, it won't analyse the image to retrieve the tags but the rest of the guestbook does not depend on it. Please notice that the terminal will display a HTTP error (status 404) in this case which can be ignored.

1. On the application dashboard of the "guestbook-main" CF app, click on "Connections" in the side bar.
2. In the table, you will see the connection to the database "guestbook-database" as entry. In its row, click on the 3 horizontal dots to open the menu.
3. In the menu, click on "View credentials" to open a popup with the credentials for this connection.
4. Copy the displayed code block either by clicking on the small copy icon or by selecting the code and copying it by using CTLR/CMD + C.
5. Open your code-editor now and go into the subdirectory "main-app".
6. In it, you will find a file called `vcap-local.json.example`. Rename this file to `vcap-local.json` and paste the code behind `"services:"`.

- vcap-local.json is the local configuration for the connection to the database. It is automatically parsed on the start of the server and contains all connection information and credentials.
- After pasting, the file should look similar to this example:

```json
{
  "services": {
    "cloudantNoSQLDB": [
    {
      <replaced by content>
    }
  ]
}
}
```

- Afterwards, the application is ready to be tested. 🎉

7. In your terminal, navigate into the folder "main-app" by using the command: `cd <Path to folder>`
8. Use the command: `npm install` to install all dependencies of the application locally. If Node.js is not installed, install the latest version on your machine (see Prerequisites).
9. Following, start the server using: `npm run dev`. This opens the server using the package nodemon which reloads the server on every file change.

- The expected output of this command looks something like this:

```shell
    ...
    Loaded local VCAP { services: { cloudantNoSQLDB: [ [Object] ] } }
    Successfully initialized cloudant client!
    [ENV] Server Port: 
    [ENV] Image Base Path: 
    [ENV] Watson Microservice: 
    Listening on port: 5000
```

- The app should be available on your local browser using the URL: http://localhost:5000/

#### Cloud Foundry Deployment (required)

1. Open your code-editor now and go into the subdirectory "main-app".
2. In the file `manifest.yml`, check the name field and if its not set already, set the value to your application name (for example: "guestbook-main").
3. In your terminal, navigate into the folder "main-app" by using the command: `cd <Path to folder>`
4. Push the application to IBM Cloud using the CLI (installation see Prerequisites):

- Use the command `ibmcloud login -sso` to log into your IBM Cloud account using Single-Sign-On.

> IF the region in the output table does NOT accord your previously selected region/location for the "guestbook-main" application, use the command `ibmcloud login -sso -r <region>` to change it (for example: `ibmcloud login -sso -r eu-gb`) for London.

- Afterwards, target your CF organization and space using `ibmcloud target --cf`. This will complete your local configuration for pushing to Cloud Foundry.
- With the command `ibmcloud cf push` you can push (upload and deploy) your application to IBM Cloud Foundry now.
- After a successful push, you will see an output similar to this:

```shell
Waiting for app to start...

name:              guestbook-main
requested state:   started
routes:            <ROUTE>
last uploaded:     Fri 19 Jul 11:12:44 CEST 2019
stack:             cflinuxfs3
buildpacks:        SDK for Node.js(TM) (ibm-node.js-6.17.1, buildpack-v3.27-20190530-0937)

type:            web
instances:       1/1
memory usage:    128M
start command:   ./vendor/initial_startup.rb
     state     since                  cpu    memory          disk          details
#0   running   2019-07-19T09:13:01Z   0.5%   28.7M of 128M   63.5M of 1G
```

- You can copy the `route` value from the output now and open it in the browser to see the deployed Guestbook.

### Watson-App

1. In your browser, go again to the IBM Cloud dashboard (https://cloud.ibm.com/).
2. Similar to the procedure for the first application, go to the "Compute" section in the IBM Cloud catalog by clicking on the navigation item "Catalog" and subsequently on the menu item "Compute" or by opening the following link: https://cloud.ibm.com/catalog?search=label:lite&category=compute
3. In the list, search for the "SDK for Node.js" product card and click on it in order to create a new Cloud Foundry (CF) App based on the Node.js buildpack.
4. Fill out the form for the app creation:

  - *App name* - To keep it simple, we will use the name "guestbook-watson" for this application. However you are free to use any other name but consider to change the name in all subsequent steps.
  - *Host name* - Choose a unique host name for your URL to be accessed by its users. This must not equal the app name.
  - *Domain* -  Leave it on the default value.
  - *Region/Location*, *Organization* and *Space* - In the Lite version, use the region London for deployment. If organization and space fields don't have any values, you have to create a new Cloud Foundry (CF) organization and space before: https://cloud.ibm.com/docs/account?topic=account-orgsspacesusers
  - *Tags* - Add the tag "guestbook" to find your resources more easily.
  - *Pricing Plans* - Select your prefered pricing plan and memory. The Lite plan and 128MB of memory are sufficient.

5. Following, click on the button "Create" to submit the form and create the app.

- You have been redirected to an application overview and the app was created. Please wait until the app is started/awake. The status can be found in the header, near to the application name.
- Additionally, by clicking on the "Routes" button and subsequently, on the public URL in the list, you can check the status of the app directly. Afterwards, go back to the IBM Cloud website.

6. Go again to the "Catalog" by clicking on the same named navigation item but this time go to the "AI" section or open the following link: https://cloud.ibm.com/catalog?search=label:lite&category=ai
7. Search for the product card "Visual Regocnition" and click on it, to create new API credentials for the IBM Watson API.
8. Fill out the form for the service creation:

- *Service name* - To keep it simple, we will use the name "guestbook-visual" for this service but you can use any other name for it as well.
- *Tags* - Add the tag "guestbook" to find your resources more easily.
- *Pricing Plans* - Select your prefered pricing plan and memory. The Lite plan is sufficient for our needs.

8. Click on the button "Create" to submit the form and create the database.

- You're redirected to the service overview.

9. In the side bar, click on the item "Connections".
10. Subsequently on the connections page, click the button "Create connection" to create a new connection configuration between the application and the service.
11. After selecting the region/location of the previously created application in the filter of the table, you will see the application "guestbook-watson" as entry in the table.
12. Hover over the "guestbook-watson" row to find the "Create" button and click on it.
13. In the form for creating the connection, you can stay with the default values. The "Access Role" should be "Manager". Following, click on "Connect & restage app".
14. You have to confirm the restaging of the "guestbook-watson" application in another popup.
15. In the table, under "Connected Applications", you will find "guestbook-watson" as entry. Click on the "guestbook-watson" row to go to the application dashboard.

#### Local Testing (Main-App + Watson-App) (optional)

Local Testing is only necessary if you consider to modify the application code. Testing the second application is more complicated than testing the first one. The Watson API requires a public URL of the image which it is going to analyse. While Cloudant lets you save files in a integrated Blob-store as well, it does require authentification for accessing the uploaded file via a public URL. That's why, the main-app provides a public URL and pipes the file-stream from Cloudant instead. However, this requires a deployed version of the main-app and some configuration which is discribed in this section.

1. Make sure the "Main-App" is deployed to Cloud Foundry and running online (see section Main-App > Cloud Foundry Deployment in this manual)
2. Open the application dashboard of the "guestbook-watson" CF application (for example by navigating to https://cloud.ibm.com/resources?groups=cf-application and clicking on the application name).
3. On the application dashboard of the "guestbook-watson" CF app, click on "Connections" in the side bar.
4. In the table, you will see the connection to the watson-service "guestbook-visual" as entry. In its row, click on the 3 horizontal dots to open the menu.
5. In the menu, click on "View credentials" to open a popup with the credentials for this connection.
6. Copy the displayed code block either by clicking on the small copy icon or by selecting the code and copying it by using CTLR/CMD + C.
7. Open your code-editor now and go into the subdirectory "watson-app".
8. In it, you will find a file called `vcap-local.json.example` as well (the same as for main-app). Rename this file to `vcap-local.json` and paste the credentials code behind `"services:"`.

- After pasting, the file should look similar to this example:

```json
{
    "services": {
      "watson_vision_combined":[
        {
          <replaced by content>
        }
      ]
    }
}
```

9. In your terminal, navigate into the folder "watson-app" by using the command: `cd <Path to folder>`.
10. Use the command: `npm install` to install all dependencies of the application locally. If Node.js is not installed, install the latest version on your machine (see Prerequisites).
11. Following, start the server using: `npm run dev`. This opens the server using the package nodemon which reloads the server on every file change.

- Expected output:
```shell
  Loaded local VCAP { services: { watson_vision_combined: [ [Object] ] } }
  Successfully initialized watson client!
  Listening on port: 3000
```
- The watson-app is running locally now 🎉
- If you only want to test the functionality of "watson-app", you can simply send HTTP-requests (for example by using curl or Postman) and send requests to `http://localhost:3000/api/image`.

12. In your terminal, navigate into the folder "main-app" by using the command: `cd <Path to folder>`.
13. Start the main-app server with the `WATSON_IMAGE_URL` enviroment variable provided. This can be done by using the command: `WATSON_IMAGE_URL=<url of deployed guestbook-main> npm run dev` (on Linux/Mac) or with the command `setx WATSON_IMAGE_URL=<url of deployed guestbook-main> && npm run dev`. (The URL of "guestbook-main" can be retrieved by visiting http://cloud.ibm.com/resources?groups=cf-application, clicking on the application name (guestbook-main) to open the dashboard, and finally clicking on the button/label "Visit App Url".) This will start the main-app locally with its own public CF URL provided.

- `WATSON_IMAGE_URL` is the public URL of guestbook-main. Because the images from Cloudant are piped via guestbook-main, this URL is used for creating the public Image-URL which is used by Watson. It is necessary to use a public URL because Watson can't access the applications on your localhost.
- Please make sure to use URLs in the formats `https://<...>/` or `http://<...>/`. Invalid or wrong URL will cause errors in the communication between main-app and watson-app!
- This will start your main-app locally with the configurated enviroment.

15. Now you can open the URL: `http://localhost:5000` in your browser to test both applications.

_Troubleshooting (if the applications doesn't work properly):_

- make sure that the guestbook-main application is running. If you open `WATSON_IMAGE_URL`, it should show you the guestbook interface
- make sure that both applications running locally and simultaneously. We recommend to use two terminal tabs to run both applications (`http://localhost:5000` && `http://localhost:3000`).
- make sure to not use URLs with dublicated or missing protocols. The URL should have the formats `https://<...>/` or `http://<...>/` and *not* something like `http://http://localhost:5000/`
- make sure the enviromental variables in main-app are set. When starting main-app locally, you will see the set enviromental variables in the start output with the prefix (`[ENV]`)
- if you changed the ports manually by editing the code or setting the PORT env varible, please make sure to change this at all occurences in code

#### CloudFoundry Deployment

1. Open your code-editor now and go into the subdirectory "watson-app".
2. In the file `manifest.yml`, check the name field and if its not set already, set the value to your application name (for example: "guestbook-watson").
3. In your terminal, navigate into the folder "watson-app" by using the command: `cd <Path to folder>`
4. Push the application to IBM Cloud using the CLI (installation see Prerequisites):

- Use the command `ibmcloud login -sso` to log into your IBM Cloud account using Single-Sign-On.

> IF the region in the output table does NOT accord your previously selected region/location for the "guestbook-watson" application, use the command `ibmcloud login -sso -r <region>` to change it (for example: `ibmcloud login -sso -r eu-gb`) for London.

- Afterwards, target your CF organization and space using `ibmcloud target --cf`. This will complete your local configuration for pushing to Cloud Foundry.
- With the command `ibmcloud cf push` you can push (upload and deploy) your application to IBM Cloud Foundry now.
- After a successful push, you will see an output table similar to the one of the Main-App Cloud Foundry Deployment.

5. Copy the route of guestbook-watson from the terminal output which should contain this section:
```shell
name:              guestbook-watson
requested state:   started
routes:            <ROUTE>
```
6. Afterwards, in your code-editor, go into the main-app folder and open the file `manifest.yml`.
7. Remove all appearences of `#` to uncomment the enviroment section. Please make sure to keep the alignment of the yaml file!
8. In the `env` section, you can find the two environmental variables `WATSON_IMAGE_URL` and `WATSON_SERVICE_URL`.

- `WATSON_IMAGE_URL` is the public URL/route of guestbook-main. Because the images from Cloudant are piped via the main-app, this URL is used for creating the public Image-URL which is used by Watson.
- `WATSON_SERVICE_URL` is the local or public URL/route of the watson-app. It is used by the main-app to send the requests to the watson-app.

9. Replace `<guestbook-watson route>` in the value of `WATSON_SERVICE_URL` by pasting the URL/route of guestbook-watson. Please make sure to keep the `https://`
10. Replace the entire value of `WATSON_IMAGE_URL` with the URL (with protocol) of guestbook-main. (The URL of "guestbook-main" can be retrieved by visiting http://cloud.ibm.com/resources?groups=cf-application, clicking on the application name (guestbook-main) to open the dashboard, and finally clicking on the button/label "Visit App Url".)

- After inserting both values, the yaml file should look similar to this:
```yaml
---
applications:
 - name: guestbook-main
   random-route: true
   memory: 128M
   env:
    WATSON_IMAGE_URL: https://<...>.mybluemix.net/
    WATSON_SERVICE_URL: https://<...>.mybluemix.net
```

11. In your terminal, navigate into the folder "main-app" by using the command: `cd <Path to folder>`
12. Push the main application again using `ibmcloud cf push` to update the environment variables and to restart the app.

If the pushing was successful, the guest images will be analysed and tags will show up when a new guest is created. You can open the ULR/route of guestbook-main in the browser for testing it.

### Container-to-Container Networking

This step can only be done after guestbook-main and guestbook-watson running publicly on IBM Cloud Foundry.

1. Go to the dashboard of guestbook-watson. (For example by opening http://cloud.ibm.com/resources?groups=cf-application and clicking on the application name)
2. Click on the button "Routes" and subsequently in the menu on "Edit routes".
3. In the popup click on "Add route" to create a new one for the application.
4. Enter a host of your choice (for example the same as of the existing route) and select "apps.internal" as system domain. This will create a new internal domain for the application. Please, remember the created route because you need it for later.
5. Furthermore, remove the existing domain (mybluemix.de) by clicking on the trash bin.
6. Afterwards, save your changes by clicking on "Save". You might have to confirm in a subsequent popup the deletion of the route.
7. Now, go again to the dashboard of guestbook-main. (For example by opening http://cloud.ibm.com/resources?groups=cf-application and clicking on the application name)
8. In the side-bar, click on "Runtime" and subsequently select "Environment variables" like in the Local Deployment of Watson-App.
9. Change the value of `WATSON_SERVICE_URL` to the recently created internal route (ending on apps.intenal) with the port 8080. Please make sure to not forget the `http://` in the beginning. Example: `http://<host>:8080`

> You can test the application now again but you will notice that the tag analysis on creating a user doesn't work. The reason therefor is that we didn't add a policy for the communication between guestbook-main and guestbook-watson yet. By removing the public route, guestbook-watson only accepts internal traffic from apps which have to be configurated first.

10. Now go to your terminal and use the command `ibmcloud cf apps` to display all your Cloud Foundry apps.
11. Make sure that both gestbook-main and guestbook-watson are `started`.
12. Use the following command and replace both app names with those you used and which are displayed on `ibmcloud cf apps`.
`ibmcloud cf add-network-policy <guestbook-main app name> --destination-app <guestbook-watson app name> --protocol tcp --port 8080`
- If it runs successfully, this command should return the response "OK".

> Now, you are able to test the application again. The policy enables guestbook-main to communicate with guestbook-watson internally via container-to-container networking, without exposing guestbook-watson publicly.

## License
Apache 2.0. See [LICENSE.txt](LICENSE.txt)

> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.


<!-- 13. In there, you will find an `env` section with the two keys `WATSON_IMAGE_URL` and `WATSON_SERVICE_URL`.

- `WATSON_IMAGE_URL` is the local or public URL of the main-app. Because the images from Cloudant are piped via the main-app, this URL is used for creating the public Image-URL which is used by Watson.
- `WATSON_SERVICE_URL` is the local or public URL of the watson-app. It is used by the main-app to send the requests to the watson-app. -->