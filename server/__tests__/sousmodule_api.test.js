const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Sousmodule = require('../models/sousmodule')

const api = supertest(app)

const sousmodulesInDb = async () => {
  const sousmodules = await Sousmodule.find({})
  return sousmodules.map(sousmodule => sousmodule.toJSON())
}

beforeEach(async () => {
  await Sousmodule.deleteMany({})

  for (const sousmodule of helper.initialmodules) {
    const sousmoduleObject = new Sousmodule(sousmodule)
    await sousmoduleObject.save()
  }
})

describe('fetching sousmodules', () => {
  test('sousmodules are returned as json', async () => {
    await api
      .get('/api/sousmodules')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all sousmodules are returned', async () => {
    const response = await api.get('/api/sousmodules')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('there are three sousmodules', async () => {
    const response = await api.get('/api/sousmodules')

    expect(response.body.length).toBe(3)
  })

  test('the first sousmodule has placeholder title', async () => {
    const response = await api.get('/api/sousmodules')

    expect(response.body[0].title).toBe('placeholder title')
  })

  test('a specific sousmodule can be viewed', async () => {
    const sousmodulesAtStart = await sousmodulesInDb()

    const sousmoduleToView = sousmodulesAtStart[0]

    const resultSousmodule = await api
      .get(`/api/sousmodules/${sousmoduleToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultSousmodule.body).toEqual(sousmoduleToView)
  })
})

describe('manipulating sousmodules', () => {
  test('a valid sousmodule can be added without populate', async () => {
    const newSousmodule = {
      title: 'async/await simplifies making async calls'
    }

    await api
      .post('/api/sousmodules')
      .send(newSousmodule)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/sousmodules')

    const titles = response.body.map(r => r.title)

    expect(response.body.length).toBe(helper.initialmodules.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('sousmodule without title is not added', async () => {
    const newSousmodule = {}

    await api
      .post('/api/sousmodules')
      .send(newSousmodule)
      .expect(400)

    const response = await api.get('/api/sousmodules')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('a sousmodule can be deleted', async () => {
    const sousmodulesAtStart = await sousmodulesInDb()
    const sousmoduleToDelete = sousmodulesAtStart[0]

    await api
      .delete(`/api/sousmodules/${sousmoduleToDelete.id}`)
      .expect(204)

    const sousmodulesAtEnd = await sousmodulesInDb()

    expect(sousmodulesAtEnd.length).toBe(
      helper.initialmodules.length - 1
    )

    const titles = sousmodulesAtEnd.map(r => r.title)

    expect(titles).not.toContain(sousmoduleToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
