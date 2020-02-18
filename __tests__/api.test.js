const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Board = require('../models/board')
const updateBoardWithMe = require('../utils/updateBoard')

const initialUsers = [
  {
    username: 'norbert',
    password: 'norbert'
  },
  {
    username: 'jeremie',
    password: 'jeremie'
  }
]

const mockBoards = [
  {
    board: [[], [], []],
    active: true,
    name: 'mockBoard'
  },
  {
    board: [[], [], []],
    active: true,
    name: 'mockBoard2'
  }

]

const boardsInDB = async () => {
  const boards = await Board.find({})
  return boards.map(board => board.toJSON())
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of initialUsers) {
    const userObject = new User(user)
    await userObject.save()
  }

  await Board.deleteMany({})

  for (const board of mockBoards) {
    const boardObject = new Board(board)
    await boardObject.save()
  }
})

describe('CRUD USER', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('should be two users in DB', async () => {
    const response = await api.get('/api/users')
    expect(response.body.length).toEqual(initialUsers.length)
  })

  test('should view a specific user', async () => {
    const users = await usersInDB()

    const norbert = users[0]

    const resultNorbert = await api
      .get(`/api/users/${norbert.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNorbert.body).toEqual(norbert)
  })
  test('should be able to add an user', async () => {
    const usersBeforeRequest = await usersInDB()

    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterRequest = await usersInDB()
    expect(usersAfterRequest.length).toBe(usersBeforeRequest.length + 1)

    const usernames = usersAfterRequest.map(n => n.username)
    expect(usernames).toContain('firmin')
  })

  test('should only update user to add boards ie. join rooms', async () => {
    const usersBeforeRequest = await usersInDB()

    const updatedUser = { ...usersBeforeRequest[0], username: 'updatedUser' }

    await api
      .put(`/api/users/${updatedUser.id}`)
      .send(updatedUser)
      .expect(500)
  })

  test('should be able to delete a user', async () => {
    const usersBeforeRequest = await usersInDB()
    const userToDelete = usersBeforeRequest[0]

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(204)

    const usersAfterRequest = await usersInDB()

    expect(usersAfterRequest.length).toBe(
      usersBeforeRequest.length - 1
    )

    const usernames = usersAfterRequest.map(r => r.username)

    expect(usernames).not.toContain(userToDelete.username)
  })

  test('should be able to login', async () => {
    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: newUser.password }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
  })

  test('should get 401 when entering wrong credentials', async () => {
    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: 'wrongPassword' }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
  })
})

describe('CRUD BOARD', () => {
  test('boards are returned as json', async () => {
    await api
      .get('/api/boards')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('should be two boards in DB', async () => {
    const response = await api.get('/api/boards')

    expect(response.body.length).toEqual(mockBoards.length)
  })

  test('should view a specific board', async () => {
    const boards = await boardsInDB()

    const firstBoard = boards[0]

    const resultBoard = await api
      .get(`/api/boards/${firstBoard.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBoard.body).toEqual(firstBoard)
  })

  test('should be able to add a board', async () => {
    const boardsBeforeRequest = await boardsInDB()

    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: newUser.password }

    const res = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)

    const newBoard = {
      board: [[], [], []],
      active: true,
      name: 'newBoard'
    }

    await api
      .post('/api/boards')
      .set('Authorization', 'Bearer ' + res.body.token)
      .send(newBoard)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const boardsAfterRequest = await boardsInDB()
    expect(boardsAfterRequest.length).toBe(boardsBeforeRequest.length + 1)

    const boardnames = boardsAfterRequest.map(n => n.name)
    expect(boardnames).toContain('newBoard')
  })

  test('should not be able to update board if not in hits users array', async () => {
    const boardsBeforeRequest = await boardsInDB()

    const newUser = {
      username: 'firmin',
      password: 'firmin'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { username: newUser.username, password: newUser.password }

    const res = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)

    const updatedBoard = { ...boardsBeforeRequest[0], name: 'updatedBoard' }

    await api
      .put(`/api/boards/${updatedBoard.id}`)
      .set('Authorization', 'Bearer ' + res.body.token)
      .send(updatedBoard)
      .expect(401)
  })

  test('should be able to delete a board', async () => {
    const boardsBeforeRequest = await boardsInDB()
    const boardToDelete = boardsBeforeRequest[0]

    await api
      .delete(`/api/boards/${boardToDelete.id}`)
      .expect(204)

    const boardsAfterRequest = await boardsInDB()

    expect(boardsAfterRequest.length).toBe(
      boardsBeforeRequest.length - 1
    )

    const names = boardsAfterRequest.map(r => r.name)

    expect(names).not.toContain(boardToDelete.name)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
