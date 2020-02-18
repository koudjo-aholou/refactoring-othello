const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Board = require('../models/board')
const updateBoard = require('../utils/updateBoard')

const initialPlayers = [
  {
    username: 'userOneBlack',
    password: 'user1'
  },
  {
    username: 'userTwoWhite',
    password: 'user2'
  }
]

const newBoard = {
  board: [[], [], []],
  active: true,
  name: 'newBoard-playerOne'
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

let playerOne;
let playerTwo;
let respBoardCreateByPlayer;
let IdBoardGame;
let respPLayerJoinBoard;
let updateBoardMove;
let respUpdateBoardPlayerOneMove;
let addPlayerTwoBoard;
let updateBoardMovePlayerTwo;

beforeEach(async () => {
 await api
    .post('/api/users')
    .send(initialPlayers[0])

  await api
    .post('/api/users')
    .send(initialPlayers[1])

  responsePlayerOne =  await api
    .post('/api/login')
    .send(initialPlayers[0])

  responsePlayerTwo =  await api
    .post('/api/login')
    .send(initialPlayers[1])
  
  playerOne = {... responsePlayerOne.body}
  playerTwo = {... responsePlayerTwo.body}

  respBoardCreateByPlayer = await api
    .post('/api/boards')
    .set('Authorization', 'Bearer ' + playerOne.token)
    .send(newBoard)
  
  IdBoardGame = respBoardCreateByPlayer.body.id

  respPLayerJoinBoard = await api
  .get(`/api/boards/${IdBoardGame}`)

  updateBoardMove = {...respBoardCreateByPlayer.body}
  updateBoardMove.board = updateBoard.byPlayerOne.board;
  updateBoardMove.turn = "white"

  respUpdateBoardPlayerOneMove =  await api
    .put(`/api/boards/${IdBoardGame}`)
    .set('Authorization', 'Bearer ' + playerOne.token)
    .send(updateBoardMove)
  
  const data = {board : IdBoardGame}
 
   addPlayerTwoBoard = await api
    .put(`/api/users/${playerTwo.id}`)
    .send(data)

  updateBoardMovePlayerTwo = {...respBoardCreateByPlayer.body}
  updateBoardMovePlayerTwo.board = updateBoard.byPlayerTwo.board
  updateBoardMovePlayerTwo.turn = "black"
  updateBoardMovePlayerTwo.blackscore = 3
  updateBoardMovePlayerTwo.whitescore = 3
})

describe('GAME', () => { 

  describe('Players Have to sign and be logged', () => {
    test('Players One create an account and logged', async () => {
      expect(responsePlayerOne.status).toEqual(200)  
      expect(playerOne.username).toEqual(initialPlayers[0].username)
    })

    test('Players Two create an account and logged', async () => {
      expect(responsePlayerTwo.status).toEqual(200)   
      expect(playerTwo.username).toEqual(initialPlayers[1].username)
    })
  })

  describe('Player One logged and Create a Game', () => {
    test('Player One creates a game and write a title', async () => {
      expect(respBoardCreateByPlayer.status).toEqual(200) 
      expect(respBoardCreateByPlayer.body.name).toEqual(newBoard.name)
    })

    test('Player One join its Game just created', async () => {
      const resultplayerOne = await api
      .get(`/api/users/${playerOne.id}`)
      .expect(200)

      expect(respPLayerJoinBoard.status).toEqual(200)
      expect(respPLayerJoinBoard.body.id).toContain(resultplayerOne.body.boards[3])
    })
  })

  describe('Player One can make a move and wait Player two \'s Move', () => {
    test('Player One has to play first',  () => {
      expect(respPLayerJoinBoard.status).toEqual(200)
      expect(respPLayerJoinBoard.body.turn).toEqual("black")
    })

    test('Player One move have been saved', () => {
        expect(respUpdateBoardPlayerOneMove.status).toEqual(200)
        expect(respUpdateBoardPlayerOneMove.body).toEqual(updateBoardMove)
    })

  })

  describe('Player two can make a move and wait Player One \'s Move', () => {
    test('Player two joins the game', () => {
      expect(addPlayerTwoBoard.status).toEqual(200)
    })

    test('Player two is allowed to play in the game', async () => {

      const resultPlayertwoCanPlayBoard = await api
      .get(`/api/boards/${IdBoardGame}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

      const playerWhiteId = resultPlayertwoCanPlayBoard.body.users[1].id
     expect(playerWhiteId).toEqual(playerTwo.id)
    })

    test('Player Two has to play',  () => {
      expect(respUpdateBoardPlayerOneMove.body.turn).toEqual("white")
    })

    test('Player Two move have been saved', async () => {
      const respUpdateBoardPlayerTwoMove =  await api
       .put(`/api/boards/${IdBoardGame}`)
       .set('Authorization', 'Bearer ' + playerTwo.token)
       .send(updateBoardMovePlayerTwo)

      expect(respUpdateBoardPlayerTwoMove.body.turn).toEqual('black')
    })
  })

  describe('Score have been saved after a player \'s Move', () => {
    test('Player one score have been saved', () => {
      expect(respUpdateBoardPlayerOneMove.body.whitescore).toEqual(updateBoardMove.whitescore)
      expect(respUpdateBoardPlayerOneMove.body.blackscore).toEqual(updateBoardMove.blackscore)

    })

    test('Player two score have been saved', async () => {
      const respUpdateBoardPlayerTwoMove =  await api
      .put(`/api/boards/${IdBoardGame}`)
      .set('Authorization', 'Bearer ' + playerTwo.token)
      .send(updateBoardMovePlayerTwo)
  
      expect(respUpdateBoardPlayerTwoMove.body.whitescore).toEqual(updateBoardMovePlayerTwo.whitescore)
      expect(respUpdateBoardPlayerTwoMove.body.blackscore).toEqual(updateBoardMovePlayerTwo.blackscore)
    })
  })
})


afterAll(() => {
  mongoose.connection.close()
})