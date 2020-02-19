const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Board = require('../models/board')

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
  test('users are returned as json', async done => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    done()
  })

  test('should be two users in DB', async done => {
    const response = await api.get('/api/users')
    expect(response.body.length).toEqual(initialUsers.length)
    done()
  })

  test('should view a specific user', async done => {
    const users = await usersInDB()

    const norbert = users[0]

    const resultNorbert = await api
      .get(`/api/users/${norbert.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNorbert.body).toEqual(norbert)
    done()
  })

  test('should be able to add an user', async done => {
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
    done()
  })

  test('should only update user to add boards ie. join rooms', async done => {
    const usersBeforeRequest = await usersInDB()

    const updatedUser = { ...usersBeforeRequest[0], username: 'updatedUser' }

    await api
      .put(`/api/users/${updatedUser.id}`)
      .send(updatedUser)
      .expect(500)
    done()
  })

  test('should be able to delete a user', async done => {
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
    done()
  })

  test('should be able to login', async done => {
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
    done()
  })

  test('should get 401 when entering wrong credentials', async done => {
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
    done()
  })
})

describe('CRUD BOARD', () => {
  test('boards are returned as json', async done => {
    await api
      .get('/api/boards')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    done()
  })

  test('should be two boards in DB', async done => {
    const response = await api.get('/api/boards')

    expect(response.body.length).toEqual(mockBoards.length)
    done()
  })

  test('should view a specific board', async done => {
    const boards = await boardsInDB()

    const firstBoard = boards[0]

    const resultBoard = await api
      .get(`/api/boards/${firstBoard.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBoard.body).toEqual(firstBoard)
    done()
  })

  test('should be able to add a board', async done => {
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
    done()
  })

  test('should not be able to update board if not in hits users array', async done => {
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
    done()
  })

  test('should be able to delete a board', async done => {
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
    done()
  })
})

afterAll(() => {
  mongoose.connection.close()
})
