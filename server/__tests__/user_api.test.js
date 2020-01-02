const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const mongoose = require('mongoose')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of helper.initialUsers) {
    const userObject = new User(user)
    await userObject.save()
  }
})

describe('when there is initially two users in the database', () => {
  test('Can add a new user ', async () => {
    const usersAtStart = await helper.usersInDb()

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
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if email already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      firstName: 'norbert',
      lastName: 'nadir',
      phone: '0608060806',
      email: 'norbert@zenika.com',
      role: 'superadmin',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`email` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
