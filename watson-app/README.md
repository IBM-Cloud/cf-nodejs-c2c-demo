# Watson Helper Service for the CloudFoundry Node.js Guestbook Demo

## Description
This is the second service of the CloudFoundry Node.js Guestbook demo. It's purpose is to demonstrate container-to-container communication and it works as a bridge between the core service (1) and the Watson Visual Recognition API. Therefore, it executes the Watson API requests and aggregates the received data to simple, sorted tags.
___
## Deployment (unformated)

0) Install CLI
0) Clone repository from GitHub
0) Login on IBM Cloud Website
1) IBM Cloud Landing Page
2) Create Resource (https://cloud.ibm.com/catalog)
3) Compute > Cloud Foundry (Section) > SDK for Node.js
4) Enter App name
5) Choose region, organization and space
   (+ plan)
6) Click on "Create"
-> App is starting
7) Go to catalog (https://cloud.ibm.com/catalog)
8) AI > Visual Recognition
9) Enter service name
   (+ select plan)
10) Click on "Create"
11) Go back to landing page (https://cloud.ibm.com/)
12) In Resource Summary, click on Cloud Foundry Apps
13) Click on previously created Node.js app
14) In Sidebar, click on Connections
15) "Create connection"
16) From the list, hover over the previously created Watson service (SERVICE OFFERING: Visual Recognition) and click on "Connect"
17) In modal, create new connection with role: "Manager" and Service ID: "Auto Generate", following click on "Connect"
18) Click on "Restage" to restage app
19) On the service in the list, click on the 3 horizontal dots to open the menu > View credentials

> For local testing and development

22) Copy the credentials
23) Start your local code editor and open the cloned project
24) Rename the file "vcap-local.json.example" to "vcap-local.json" and open it
25) Paste credentials after the colon of the services key
```
"services": <paste credentials here>
```
26) Save the file
27) (Install Node)
28) Run in Terminal:
```
npm install --save

npm run dev
```
-> service is available under > localhost:3000

> Deployment to CloudFoundry

22) Start your local code editor and open the cloned project
23) Open the file "manifest.yml", change name to your app name and memory to the selected memory
24) Save manifest.yml and close the file
25) in Terminal:

-> login using your online credentials
```
ibmcloud login
```
-> target organization and space
```
ibmcloud target --cf
```
-> push application to CloudFoundry
```
ibmcloud cf push
```

___
## API Routes


Route | Description
--- | ---
/api | Simple API Route to check if the server is still available.
/api/image | API Route for analysing an image (using a provided URL) and returning a list of tags plus additional data (age, faceLocation).

___
## Watson Visial Recognition Example Data

This app uses two different Watson API Endpoints, /classify and /detect_faces. Because the returned combined data is very nested, here is an example result as help for changes on the tags:

```json
    {
    "general": {
        "images": [{
            "classifiers": [{
                "classifier_id": "default",
                "name": "default",
                "classes": [
                    {
                        "class": "face",
                        "score": 0.861,
                        "type_hierarchy": "..."
                    },
                    {
                        "class": "person",
                        "score": 0.889
                    },
                    {
                        "class": "portrait photo",
                        "score": 0.5,
                        "type_hierarchy": "..."
                    },
                    {
                        "class": "jade green color",
                        "score": 0.629
                    },
                    {
                        "class": "blue color",
                        "score": 0.526
                    }
                ]
            }],
            "source_url": "...",
            "resolved_url": "..."
        }],
        "images_processed": 1,
        "custom_classes": 0
    },
    "faces": {
        "images": [{
            "faces": [{
                "age": {
                    "min": 28,
                    "max": 32,
                    "score": 0.65484005
                },
                "face_location": {
                    "height": 849,
                    "width": 754,
                    "left": 256,
                    "top": 571
                },
                "gender": {
                    "gender": "MALE",
                    "gender_label": "male",
                    "score": 0.99961853
                }
            }],
            "source_url": "...",
            "resolved_url": "..."
        }],
        "images_processed": 1
    }
}
```
