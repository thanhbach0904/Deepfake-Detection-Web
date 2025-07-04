# This is the application product of Nguyen Tien Thanh for HUST's PROJECT 2 course.




Notes:

# RUN

Set up the database:

Create `.env` file at the root of the project, you can read the instrcutions in the `.env.example` file to see the template, replace with the username and password you want to use or just use the default values.


Then, run the following commands:

```bash
cd backend 
npm install #install needed packages for nodeJS
python -m pip install requirements.txt #install python libraries for detection task
npm run dev
```
Run frontend:

You can open the run.bat file in the frontend folder, or you can type these in the terminal:
```bash
cd frontend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install #install needed packages for nodeJS
npm start
```
If you want to run both of them, open two different terminals.

The process will be as follows:

User access to routes, which then calls the controller functions (may go throuhgt middelware berfore actual go to thet controller). The controller function hande the request, call the service functions, and return the response to the user. The services perfrom the business logic and interact with the database through the models. The models define the database structure and interact with the database. The database returns the data to the models, which then return the data to the services, and then to the controller, and finally to the user.




### REQUEST FORM FOR BACKEND
```bash
# POST/register :
{ 
    "username": "abcxyz",
    "email": "abcxyz@gmail.com",
    "password": "abcxyz",
    "role" : ["user","admin"] DEFAULT "user"
}

# POST/login:
{ 
    "email": "abcxyz@gmail.com",
    "password": "abcxyz"
}

# GET/allusers
{
    "header":{
        "Authorization": "Beare <jwt_token>"
    }
}

<jwt_token> appears after an user login to the web, and this will be pass to verifyToken then to 
authorize to check if they are admin or not

The same for 
# GET /roles/users/:userId
userId in mongoDB has ObjectId(string) type, check in adminService.js for how to deal with it
```

