# icebox-service
The icebox service. Manage all your beverages.

## Set Up IceBox
### Set Up The Database
Icebox uses a PostgreSQL database. 

You have to set up a database and define a user which the icebox may use. Icebox uses environment variables to access the db, so you have to set the values in 
 * ICEBOX_DB_HOST
 * ICEBOX_DB_PORT
 * ICEBOX_DB_USER
 * ICEBOX_DB_PSW
 * ICEBOX_DB_NAME
### Set Up Icebox
Icebox is completly written with nodeJS.

 * `npm install` will install all needed components
 * `jake db:create` creates the tables in the database.
 * `npm start` will start the service
 
As a test run localhost:8081/drinks and you should get an empty json response.

#### Known issues during testing:
It is currently not possible to run two instances of icebox in the same network due to the bonjour registration. No two services with the same name can exist and a second icebox service will this not start. 

To avoid this, delete the bonjour-registration in the server.js file while testing.

## API-Docs
The API-Doku is on apiary.

* https://iceboxservice.docs.apiary.io/

## Projects using the service
These projects are not officially supported. Run at your own risk and stuff.

* Touch-Client für den Pi auf dem Kühlschrank
  * https://github.com/MotieDesign101/IceBoxTouch
* Web-Client für icebox.nobreakspace.org
  * https://github.com/MotieDesign101/IceBoxWebClient
* Android Client
  * https://github.com/malteschmitz/icebox-android
* Twitter-Bot
    * https://github.com/MotieDesign101/IceBox-Twitter
* Alias-Service
    * https://github.com/MotieDesign101/iceBoxAlias
    
## Other projects that have some connection to the icebox-service
* IceBox Light
    * https://github.com/MotieDesign101/IceBoxLight
