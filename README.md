# GLLSS - Global Loot League Staff Scheduler

GLLSS is a web application created to make the life of GLL Staff easier.
It includes many features which are supposed to make spreadsheet usage no longer necessary, automate some processes and open new possibilities.
The list of features can be found [here](#features).

## Backstory
Once I joined GLL team my dear friend Michelle (host lead for GLL) told me about the web app idea which was suggested by one of the employees. She wanted to make it on her own but since she was lacking time and skills needed I offered my help to take over the development. I started right away (5th of March 2020) and after 1.5 month the primary version was ready.

## Features
 - Role-based access control
 - CRUD operations for series, tournaments, rounds etc.
 - Choosing availability for specific tournaments and rounds
 - Scheduling staff based on their availability
 - Checking in (confirming scheduled hosting) during a time window
 - Balance for each week (allowing to schedule more fairly) with "lost hosting/leading" calculation
 - checking schedule for balance, data for the current, past and next week
 - System for claiming Steam accounts/Apex codes used for hosting
 - Earnings calculation based on hosted/lead tournaments and their parameters
 - Ability to write articles and guides on site
 - Admin panel
 
## Tech
### Backend
  - Node.js
  - MongoDB
  - bcrypt
  - Nodemailer
  - Joi
  - Winston, morgan
  - JSONWebToken

### Frontend
  - Vue.js with Vuex/Vue Router
  - Vuetify
  - Babel
  - Webpack
  - Axios
  - moment

### Installation

GLLSS requires [Node.js](https://nodejs.org/) v8.\* to run.

1. Install the latest version of NodeJS and npm.
2. Clone the application's repository.
3. Navigate to the root folder of the application in the command line (be sure to open as an administrator).
4. Type npm install to install required npm packages.
5. If bcrypt throws errors while installing packages try to do the following.

```
$ npm i bcrypt@3.0.6
```

5. Type node index to start a development server.
6. The server should now be running at port 3000 unless a different one is set.
7. Go to the client folder in the **new** command line.
8. Install Vue CLI by `npm install -g @vue/cli`.
9. Client should be running at http://localhost:8080/

## Guide
Here is the link to the guide - [Guide](GUIDE.md)