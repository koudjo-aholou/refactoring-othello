# Reversi Game Multiplayer

This app features a reversi multiplayer game powered with React, websockets and nodejs api.

## `/!\Installation/!\`
Before starting anything, make sure you install everything in root folder and /client folder with npm
> npm install

### Environment variables
Environment variables should be placed in a .env file at the project's root. It should contain a mongodb atlas uri, a mongodb atlas test uri, a port number and a secret phrase for authentication hashing. 

Current port for the application to run correctly is set at 5000!


example .env file:
>MONGODB_URI=mongodb+srv://YOURMONGONAME:YOURMONGOPASSWORD@cluster0-sz2b9.gcp.mongodb.net/YOURPROJECTNAME?retryWrites=true&w=majority

>TEST_MONGODB_URI=mongodb+srv://YOURMONGONAME:YOURMONGOPASSWORD@cluster0-sz2b9.gcp.mongodb.net/YOURPROJECTNAME-test?retryWrites=true&w=majority

>PORT=9000

>SECRET="YOUR SECRETE PHRASE"


## `npm start` - Starting the application

/!\ If needed, build the application by running "npm run build" inside the client. Then, put the newly created build folder (inside client) into the root folder. /!\ 

Runs the backend api as well as the react app in the "client" folder. 

## bug cross-env
Reinstall cross-env : npm install -D cross-env

## `Play the game`

Once started, you can view the project on : http://localhost:9000

Once on the homepage, you can create an account with the "créer" form or login.

Logged users can see active games and join them if they are not full. Otherwise, they can create their own game.

### `Game logic`

The gamelogic is located in /client/src/utils/gameLogic.js
It is used to generate the board, initialize its first state and provide logic to filter tiles, reset them, make a move.

### `npm test`

You can run the tests with this command. All tests are written with jest framework.

### `npm lint`

You can run the linter (ESLint) with this command.
