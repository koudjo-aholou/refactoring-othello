const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Programme = require('../models/programme')

const api = supertest(app)

const programmesInDb = async () => {
  const programmes = await Programme.find({})
  return programmes.map(programme => programme.toJSON())
}

beforeEach(async () => {
  await Programme.deleteMany({})

  for (const programme of helper.initialmodules) {
    const programmeObject = new Programme(programme)
    await programmeObject.save()
  }
})

describe('fetching programmes', () => {
  test('programmes are returned as json', async () => {
    await api
      .get('/api/programmes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all programmes are returned', async () => {
    const response = await api.get('/api/programmes')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('there are three programmes', async () => {
    const response = await api.get('/api/programmes')

    expect(response.body.length).toBe(3)
  })

  test('the first programme has placeholder title', async () => {
    const response = await api.get('/api/programmes')

    expect(response.body[0].title).toBe('placeholder title')
  })

  test('a specific programme can be viewed', async () => {
    const programmesAtStart = await programmesInDb()

    const programmeToView = programmesAtStart[0]

    const resultProgramme = await api
      .get(`/api/programmes/${programmeToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultProgramme.body).toEqual(programmeToView)
  })
})

describe('manipulating programmes', () => {
  test('a valid programme can be added without populate', async () => {
    const newProgramme = {
      title: 'async/await simplifies making async calls'
    }

    await api
      .post('/api/programmes')
      .send(newProgramme)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/programmes')

    const titles = response.body.map(r => r.title)
    expect(response.body.length).toBe(helper.initialmodules.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('programme without title is not added', async () => {
    const newProgramme = {}

    await api
      .post('/api/programmes')
      .send(newProgramme)
      .expect(400)

    const response = await api.get('/api/programmes')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('a programme can be deleted', async () => {
    const programmesAtStart = await programmesInDb()
    const programmeToDelete = programmesAtStart[0]

    await api
      .delete(`/api/programmes/${programmeToDelete.id}`)
      .expect(204)

    const programmesAtEnd = await programmesInDb()

    expect(programmesAtEnd.length).toBe(
      helper.initialmodules.length - 1
    )

    const titles = programmesAtEnd.map(r => r.title)

    expect(titles).not.toContain(programmeToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
