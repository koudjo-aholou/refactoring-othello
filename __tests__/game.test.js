const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

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

let playerOne
let responsePlayerOne
let playerTwo
let responsePlayerTwo
let respBoardCreateByPlayer
let idBoardGame
let respPlayerJoinsBoard
let updateBoardFirstMove
let respUpdateBoardPlayerOneMove
let addPlayerTwoBoard
let updateBoardMovePlayerTwo

beforeEach(async () => {
  await api
    .post('/api/users')
    .send(initialPlayers[0])

  await api
    .post('/api/users')
    .send(initialPlayers[1])

  responsePlayerOne = await api
    .post('/api/login')
    .send(initialPlayers[0])

  responsePlayerTwo = await api
    .post('/api/login')
    .send(initialPlayers[1])

  playerOne = { ...responsePlayerOne.body }
  playerTwo = { ...responsePlayerTwo.body }

  respBoardCreateByPlayer = await api
    .post('/api/boards')
    .set('Authorization', 'Bearer ' + playerOne.token)
    .send(newBoard)

  idBoardGame = respBoardCreateByPlayer.body.id

  respPlayerJoinsBoard = await api
    .get(`/api/boards/${idBoardGame}`)

  updateBoardFirstMove = { ...respBoardCreateByPlayer.body }
  updateBoardFirstMove.board = updateBoard.byPlayerOne.board
  updateBoardFirstMove.turn = 'white'

  respUpdateBoardPlayerOneMove = await api
    .put(`/api/boards/${idBoardGame}`)
    .set('Authorization', 'Bearer ' + playerOne.token)
    .send(updateBoardFirstMove)

  const data = { board: idBoardGame }

  addPlayerTwoBoard = await api
    .put(`/api/users/${playerTwo.id}`)
    .send(data)

  updateBoardMovePlayerTwo = { ...respBoardCreateByPlayer.body }
  updateBoardMovePlayerTwo.board = updateBoard.byPlayerTwo.board
  updateBoardMovePlayerTwo.turn = 'black'
  updateBoardMovePlayerTwo.blackscore = 3
  updateBoardMovePlayerTwo.whitescore = 3
})

describe('GAME', () => {
  describe('Players Have to sign and be logged', () => {
    test('Players One create an account and logged', async done => {
      expect(responsePlayerOne.status).toEqual(200)
      expect(playerOne.username).toEqual(initialPlayers[0].username)
      done()
    })

    test('Players Two create an account and logged', async done => {
      expect(responsePlayerTwo.status).toEqual(200)
      expect(playerTwo.username).toEqual(initialPlayers[1].username)
      done()
    })
  })

  describe('Player One logged and Create a Game', () => {
    test('Player One creates a game and write a title', async done => {
      expect(respBoardCreateByPlayer.status).toEqual(200)
      expect(respBoardCreateByPlayer.body.name).toEqual(newBoard.name)
      done()
    })

    test('Player One join its Game just created', async done => {
      const resultplayerOne = await api
        .get(`/api/users/${playerOne.id}`)
        .expect(200)

      expect(respPlayerJoinsBoard.status).toEqual(200)
      expect(respPlayerJoinsBoard.body.id).toContain(resultplayerOne.body.boards[3])
      done()
    })
  })

  describe('Player One can make a move and wait Player two \'s Move', () => {
    test('Player One has to play first', done => {
      expect(respPlayerJoinsBoard.status).toEqual(200)
      expect(respPlayerJoinsBoard.body.turn).toEqual('black')
      done()
    })

    test('Player One move have been saved', done => {
      expect(respUpdateBoardPlayerOneMove.status).toEqual(200)
      expect(respUpdateBoardPlayerOneMove.body).toEqual(updateBoardFirstMove)
      done()
    })
  })

  describe('Player two can make a move and wait Player One \'s Move', () => {
    test('Player two joins the game', done => {
      expect(addPlayerTwoBoard.status).toEqual(200)
      done()
    })

    test('Player two is allowed to play in the game', async done => {
      const resultPlayertwoCanPlayBoard = await api
        .get(`/api/boards/${idBoardGame}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const playerWhiteId = resultPlayertwoCanPlayBoard.body.users[1].id
      expect(playerWhiteId).toEqual(playerTwo.id)
      done()
    })

    test('Player Two has to play', done => {
      expect(respUpdateBoardPlayerOneMove.body.turn).toEqual('white')
      done()
    })

    test('Player Two move have been saved', async done => {
      const respUpdateBoardPlayerTwoMove = await api
        .put(`/api/boards/${idBoardGame}`)
        .set('Authorization', 'Bearer ' + playerTwo.token)
        .send(updateBoardMovePlayerTwo)

      expect(respUpdateBoardPlayerTwoMove.body.turn).toEqual('black')
      done()
    })
  })

  describe('Score have been saved after a player \'s Move', () => {
    test('Player one score have been saved', done => {
      expect(respUpdateBoardPlayerOneMove.body.whitescore).toEqual(updateBoardFirstMove.whitescore)
      expect(respUpdateBoardPlayerOneMove.body.blackscore).toEqual(updateBoardFirstMove.blackscore)
      done()
    })

    test('Player two score have been saved', async done => {
      const respUpdateBoardPlayerTwoMove = await api
        .put(`/api/boards/${idBoardGame}`)
        .set('Authorization', 'Bearer ' + playerTwo.token)
        .send(updateBoardMovePlayerTwo)

      expect(respUpdateBoardPlayerTwoMove.body.whitescore).toEqual(updateBoardMovePlayerTwo.whitescore)
      expect(respUpdateBoardPlayerTwoMove.body.blackscore).toEqual(updateBoardMovePlayerTwo.blackscore)
      done()
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
