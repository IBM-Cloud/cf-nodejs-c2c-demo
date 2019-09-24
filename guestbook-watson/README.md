# Guestbook-Watson Detailed Information

## Description
This is the second microservice ("guestbook-watson") of the Cloud Foundry Node.js Guestbook demo. Its purpose is to demonstrate container-to-container communication by working as a bridge between "guestbook-main" and the Watson Visual Recognition API. Therefore, it executes the Watson API requests and aggregates the received data to simple, sorted tags. These tags are transmitted back to "guestbook-main" and from there are saved in the database.
___
## API Routes

Method | Route | Description | Body
--- | --- | --- | ---
GET | /api | Simple API Route to check the server status. | -
POST | /api/image | API Route for analysing an image (using a provided URL) and returning a list of tags plus additional data (`age`, `faceLocation`). | "imageUrl"

___
## Watson Visial Recognition Example Data

This app currently only uses the general Watson API Endpoints /classify. However, the code already provides support for combining the resultes of multiple endpoints. Because the returned data is very nested, here is an example response as help for changes of the tag creation:

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
    }
}
```
