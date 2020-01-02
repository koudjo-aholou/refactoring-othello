const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Module = require('../models/module')

const api = supertest(app)

const modulesInDb = async () => {
  const modules = await Module.find({})
  return modules.map(module => module.toJSON())
}

beforeEach(async () => {
  await Module.deleteMany({})

  for (const module of helper.initialmodules) {
    const moduleObject = new Module(module)
    await moduleObject.save()
  }
})

describe('fetching modules', () => {
  test('modules are returned as json', async () => {
    await api
      .get('/api/modules')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all modules are returned', async () => {
    const response = await api.get('/api/modules')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('there are three modules', async () => {
    const response = await api.get('/api/modules')

    expect(response.body.length).toBe(3)
  })

  test('the first module has placeholder title', async () => {
    const response = await api.get('/api/modules')

    expect(response.body[0].title).toBe('placeholder title')
  })

  test('a specific module can be viewed', async () => {
    const modulesAtStart = await modulesInDb()

    const moduleToView = modulesAtStart[0]

    const resultModule = await api
      .get(`/api/modules/${moduleToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultModule.body).toEqual(moduleToView)
  })
})

describe('manipulating modules', () => {
  test('a valid module can be added without populate', async () => {
    const newModule = {
      title: 'async/await simplifies making async calls'
    }

    await api
      .post('/api/modules')
      .send(newModule)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/modules')

    const titles = response.body.map(r => r.title)

    expect(response.body.length).toBe(helper.initialmodules.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('module without title is not added', async () => {
    const newModule = {}

    await api
      .post('/api/modules')
      .send(newModule)
      .expect(400)

    const response = await api.get('/api/modules')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('a module can be deleted', async () => {
    const modulesAtStart = await modulesInDb()
    const moduleToDelete = modulesAtStart[0]

    await api
      .delete(`/api/modules/${moduleToDelete.id}`)
      .expect(204)

    const modulesAtEnd = await modulesInDb()

    expect(modulesAtEnd.length).toBe(
      helper.initialmodules.length - 1
    )

    const titles = modulesAtEnd.map(r => r.title)

    expect(titles).not.toContain(moduleToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
