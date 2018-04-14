# icebox-service
The icebox service. Manage all your beverages.

## Set Up IceBox
### Set Up The Database
Icebox uses a PostgreSQL database. 

You have to set up a database and define a user which the icebox may use. Icebox uses environment variables to access the db, so you have to set the values in 
 * ICEBOX_DB_USER
 * ICEBOX_DB_PSW
 * ICEBOX_DB_NAME
### Set Up Icebox
Icebox is completly written with nodeJS.

* npm install will install all needed components
* Using "jake db:create" you can create the tables in the database.
* npm start will start the service

## Projects using the service
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
