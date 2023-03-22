
# Birthdays and Anniversaries automation script

This script send slack message in group and email to an organization for anyone having Birthdays or Anniversaries.



## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environement.


## Node

- #### Node installation on Windows
Just go on [official Node.js website](https://nodejs.org/en) and download the installer. Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

Node installation on Ubuntu
You can install nodejs and npm easily with apt install, just run the following commands.

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v19.0.1

    $ npm --version
    8.19.2

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###

## Install

    $ git clone https://github.com/divyanshigkmit/HR-automation-appscript.git
    $ cd HR-automation-appscript
    $ npm install

## Configure app

    create .env file with following values

    DB_HOST = Database Host ex localhost:3306 
    DB_DATABASE= Database Name ex UserManagementSystem
    DB_PORT= Port No on which database is running ex for mysql 3306
    DB_USERNAME= User Name of DB User
    DB_PASSWORD= Paasword of Db User
    WEBHOOK_URL= webhook url of slack bot
    S3_URL= prefix s3 url to get photo
    SCRIPT_SCHEDULER_TIME= time for scheduler to run

 #required for sending email
    MAIL_USER
    MAIL_PASS

## Database conectivity
    you need a database and make changes in .env and config.js file

## Running the project
    node appScript.js
## Output on running npm start
    Database Connected!


## Acknowledgements

 - [Slack API](https://api.slack.com/apps/A04N71U0EJF/general?)


