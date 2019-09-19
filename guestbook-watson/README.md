# Watson-App Detailed Information

## Description
This is the second microservice (watson-app) of the Cloud Foundry Node.js Guestbook demo. Its purpose is to demonstrate container-to-container communication by working as a bridge between the main-app and the Watson Visual Recognition API. Therefore, it executes the Watson API requests and aggregates the received data to simple, sorted tags. These tags are transmitted back to the main-app and from there saved in the database.
___
## API Routes

Method | Route | Description | Body
--- | --- | --- | ---
GET | /api | Simple API Route to check the server status. | -
POST | /api/image | API Route for analysing an image (using a provided URL) and returning a list of tags plus additional data (`age`, `faceLocation`). | "imageUrl"

___
## Watson Visial Recognition Example Data

This app uses two different Watson API Endpoints, /classify and /detect_faces. Because the returned combined data is very nested, here is an example response as help for changes on the tag creation:

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
