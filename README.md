# Reversi Game Multiplayer

This app features a reversi multiplayer game powered with React, websockets and nodejs api.

## `/!\Installation/!\`
Before starting anything, make sure you install everything in root folder and /client folder with npm
> npm install


### `npm start`
Runs the backend api as well as the react app in the "client" folder. 


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
