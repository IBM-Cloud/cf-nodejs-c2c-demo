# Node.js IBM CloudFoundry Demo

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

### Service Setup

### Local Deployment

### CloudFoundry Deployment

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
