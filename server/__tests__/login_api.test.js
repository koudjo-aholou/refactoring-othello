const mongoose = require('mongoose')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of helper.initialUsers) {
    const userObject = new User(user)
    await userObject.save()
  }
})

describe('Login tests', () => {
  test('A user can login ', async () => {
    const newUser = {
      firstName: 'martin',
      lastName: 'bequin',
      phone: '0101010101',
      email: 'salainen@salainen.com',
      role: 'eleve',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { email: newUser.email, password: newUser.password }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
  })

  test('A user with wrong login will receive 401 error', async () => {
    const newUser = {
      firstName: 'martin',
      lastName: 'bequin',
      phone: '0101010101',
      email: 'salainen@salainen.com',
      role: 'eleve',
      password: 'salainen'
    }

    const WrongPasswordUser = { ...newUser, password: 'lalala' }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const credentials = { email: newUser.email, password: WrongPasswordUser.password }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
