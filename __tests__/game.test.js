const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Board = require('../models/board')
const updateBoardWithMe = require('../utils/updateBoard')

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
let updateBoardPlayer;

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
  updateBoardMove.board = updateBoardWithMe.board;

  updateBoardPlayer =  await api
    .put(`/api/boards/${IdBoardGame}`)
    .set('Authorization', 'Bearer ' + playerOne.token)
    .send(updateBoardMove)
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
     // console.log(resultplayerOne.body.boards[3], respPLayerJoinBoard.body.id, "============================ ))))))))")
      expect(respPLayerJoinBoard.status).toEqual(200)
      expect(respPLayerJoinBoard.body.id).toEqual(resultplayerOne.body.boards[3])
    })
  })

  describe('Player One can make a move and wait Player two \'s Move', () => {
    test('Player One has to play first',  () => {
      expect(respPLayerJoinBoard.body.turn).toEqual("black")
    })

    test('Player One move have been saved', () => {
        expect(updateBoardPlayer.status).toEqual(200)
        expect(updateBoardPlayer.body).toEqual(updateBoardMove)
    })

  })

  describe('Player two can make a move and wait Player One \'s Move', () => {
    test('Player Two has to play',  () => {
      expect(updateBoardPlayer.body.turn).toEqual("black")
    })

    test('Player Two move have been saved', () => {

  })
  })
})