# Guestbook-Main Detailed Information

## Description
This is the first of two microservices ("guestbook-main") of the Cloud Foundry Node.js Guestbook demo. It is responsible for the core functionality of the Guestbook (e.g. listing all entries, adding a new entry) and also communicates directly with the Cloudant database to save and retrieve the data. Furthermore, it serves the user-interface on the host path (`/`).
Indifference to the second microservice ("guestbook-watson"), it is essential for the application and must be running. However, "guestbook-main" doesn't communicate with the Watson Visual Recognition API directly and hence depends on "guestbook-watson" for the tag analysis.

___
## API Routes

Method | Route | Description | Body
--- | --- | --- | ---
GET | /api | Simple API Route to check the server status. | -
GET | /api/guests | API Route for listing all Guestbook entries from the database. Contains information like `id`, `name`, `fileName`, `tags` and `tagData`. | -
POST | /api/guests | API Route for adding a new entry to the Guestbook. Hereby, `photoUrl` must be a base64 encoded data URL of the image. | "username", "photoUrl"
GET | /api/attachment/{fileName} | Simple API Route which can be used as link to the entry image. `{fileName}` can be retrieved by `GET /api/guests` | -

___
## Custom Logo

1) Put an **SVG Image** of the logo into the following folder: `guestbook-main/views/assets/images/`.

> It is recommended to change the name of the image file to something rememberable (e.g. name of the company).

2) Open the file `guestbook-main/views/index.html`.
3) In the following lines (~ 31-32):

```html
<!-- >>> CHANGE LOGO HERE <<< -->  
<img class="logo" src="./assets/images/ibm.svg" alt="logo">
```

change the path/file in the `src` attribute of the `img` component to the one of the new logo:

```html
<!-- >>> CHANGE LOGO HERE <<< -->  
<img class="logo" src="./assets/images/<YOUR FILE NAME + EXTENSION HERE>" alt="logo">
```

4) Save the file and push or locally restart the application.

___

## Troubleshooting

Most of the issues that can occur in setting up this application are due to wrong URLs or defect service connections. If you stumble upon an issue, for example, if the tags are not loading on creating a Guestbook entry, try the following things:

- Make sure that you completed your current section of the documentation completely and that you didn't forget any steps.
- Check for errors in the application output. Either locally within your terminal if you're testing the application locally, or with the command `imbcloud cf logs <app name> --recent` if it is running already on IBM Cloud Foundry. In this case, you can see the app names via `ibmcloud cf apps`. In case of a logged error, try the solutions in the subsequent table.
- If you already pushed one or both applications, make sure that the status of both applications is `started` or `awake`. You can check this by either going to the dashboard of the respective app or using `ibmcloud cf apps`. In case one app isn't started, you can start it via the terminal using `ibmcloud cf start <app name>`.
- In the case of local testing, check the `vcap-local.json` file in both guestbook-main and guestbook-watson directories and compare their structure with the examples from the documentation. Already a missing or spare `{` can cause an error while parsing the file (Usually, most code editors report these kinds of format errors). Please also make sure that the connection between the application and the service is still established. You can figure this out by going to the App Dashboard and subsequent on "Connections" in the sidebar to see the connected services.
- If you are running both applications ("guestbook-main" and "guestbook-watson") online, make sure that you have provided all environmental variables (URLs) to "guestbook-main" correctly. You can check this by using the following command in your terminal: `ibmcloud env <app name>` and by having a look in the "User-Provided" section of the output. For the proper configuration and formation, please have a look into the sections "Connecting both applications" and "Container-to-Container Networking". If you're testing locally, make sure that the URL in the command `WATSON_IMAGE_URL=<url of deployed guestbook-main> npm run dev` (Linux/Mac) or `setx WATSON_IMAGE_URL=<url of deployed guestbook-main> && npm run dev` (Windows) is right.
- If you did **not** use the App names "guestbook-main" and/or "guestbook-watson" for the microservices but used some other names instead, make sure that you changed the name at all occurrences. This especially applies to both `manifest.yml` files. Please make sure that the value of the `name` field matches your chosen App name. You can check the app names again by using the command `ibmcloud cf apps`.

**Common Errors**

Behaviour | Common Reason
--- | ---
After adding an entry, the image of the guest card is grey | The grey colour is the placeholder for the image and means that the application could not save the image in the database. Please check if "guestbook-main" is connected to "guestbook-database" (for example by using `ibmcloud cf services` and having a look on "bound apps")
Both applications are running but tags do not show up | Usually, this appears if "guestbook-main" can not reach "guestbook-watson" for example because the environmental variables `WATSON_IMAGE_URL` or `WATSON_SERVICE_URL` are wrong. In case you haven't implemented the container-to-container networking yet, check if both URLs contain the protocol `https://` in front of the host path and that they don't have duplicated `/` slash symbols in the end (well-formated example: `https://guestbook-main-xyz.eu-gb.mybluemix.net/`). Furthermore, both apps should be openable in your browser ("guestbook-watson" will by default show an error response via the link). If you have already implemented container-to-container networking, make sure that you have created the internal route (step 4) and that you changed the `WATSON_SERVICE_URL` environmental variable to the internal route. In opposite to the previous URLs, the internal route only has an `http://` protocol. Additionally, you have to add the port `:8080` at the end of the URL (well-formated example: `http://guestbook-watson-xyz.apps.internal:8080`)
The tags do not match the image | Watson has issues analysing very small images. Please make sure to use images with a size of at least 500x500 pixels.
