
- []: update password for users
- []: look again at the video_infer.py, the checkpoint is not match with the model class defined in the code
- []: separate the current inferRoutes.js -> inferRoutes.js + inferControllers.js
- []: the state of the web is changed (lost detection result) after user change to another tab or app -> fix it.

- []: train again the image and video detection model
- []: create a tab for user to post some images and videos, along with the caption. Other users can see it and comment to the post. After posting the content the system will suggest if the content is deepfake or not.
- []: change the infer model in the backend to new model
- []: add comment ? 
- []: when typing the filter in the pinterest feed, fix the bug where the tab goes up and down rapidly


- [Done]: create a new pop up to see the image (like pinterest) when open an image in pinterestFeed
- [Done]: create new table to store log's information of user, to know when an user is access to the system, creating global variables to know how many users are active at once
- [Done]: self train an image detection model using vggnet 16 structure
- [Done]: create user's tab and integrate it with history tab. For admin the history tab will be use to see all history and history of some user's (log information, detection history, .....)
- [Done]: History tab is still error.
- [Done]: change the position of the feedback button
- [Done]: save detection history after system gives prediction and modified if the user gives feedback
- [Done]: add feedback and autoscroll feature for results window
- [Done]: the detection window still appears after navigate to history or real time detection, even after log out fix this
- [Done]: for frontend, restrict the uploaded videos to ~ 30-40 seconds, and adding waiting animations
- [Done]: historyService.js, historyRoute.js and historyControllers.js
- [Done]: define api to handle image/videos detection - pass to a python inference file
- [Done]: admin can manage users from system
- [Done]: create HistoryModel - includes {user_id, content_uploaded, detection_result, detection_time} 
