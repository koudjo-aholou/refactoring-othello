const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Sequence = require('../models/sequence')

const api = supertest(app)

const sequencesInDb = async () => {
  const sequences = await Sequence.find({})
  return sequences.map(sequence => sequence.toJSON())
}

beforeEach(async () => {
  await Sequence.deleteMany({})

  for (const sequence of helper.initialmodules) {
    const sequenceObject = new Sequence(sequence)
    await sequenceObject.save()
  }
})

describe('fetching sequences', () => {
  test('sequences are returned as json', async () => {
    await api
      .get('/api/sequences')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all sequences are returned', async () => {
    const response = await api.get('/api/sequences')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('there are three sequences', async () => {
    const response = await api.get('/api/sequences')

    expect(response.body.length).toBe(3)
  })

  test('the first sequence has placeholder title', async () => {
    const response = await api.get('/api/sequences')

    expect(response.body[0].title).toBe('placeholder title')
  })

  test('a specific sequence can be viewed', async () => {
    const sequencesAtStart = await sequencesInDb()

    const sequenceToView = sequencesAtStart[0]

    const resultSequence = await api
      .get(`/api/sequences/${sequenceToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultSequence.body).toEqual(sequenceToView)
  })
})

describe('manipulating sequences', () => {
  test('a valid sequence can be added without populate', async () => {
    const newSequence = {
      title: 'async/await simplifies making async calls'
    }

    await api
      .post('/api/sequences')
      .send(newSequence)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/sequences')

    const titles = response.body.map(r => r.title)
    expect(response.body.length).toBe(helper.initialmodules.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('sequence without title is not added', async () => {
    const newSequence = {}

    await api
      .post('/api/sequences')
      .send(newSequence)
      .expect(400)

    const response = await api.get('/api/sequences')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('a sequence can be deleted', async () => {
    const sequencesAtStart = await sequencesInDb()
    const sequenceToDelete = sequencesAtStart[0]

    await api
      .delete(`/api/sequences/${sequenceToDelete.id}`)
      .expect(204)

    const sequencesAtEnd = await sequencesInDb()

    expect(sequencesAtEnd.length).toBe(
      helper.initialmodules.length - 1
    )

    const titles = sequencesAtEnd.map(r => r.title)

    expect(titles).not.toContain(sequenceToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
