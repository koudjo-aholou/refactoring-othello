const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Ressource = require('../models/ressource')

const api = supertest(app)

beforeEach(async () => {
  await Ressource.deleteMany({})

  for (const ressource of helper.initialRessources) {
    const ressourceObject = new Ressource(ressource)
    await ressourceObject.save()
  }
})

describe('fetching ressources', () => {
  test('ressources are returned as json', async () => {
    await api
      .get('/api/ressources')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all ressources are returned', async () => {
    const response = await api.get('/api/ressources')

    expect(response.body.length).toBe(helper.initialRessources.length)
  })

  test('there are three ressources', async () => {
    const response = await api.get('/api/ressources')

    expect(response.body.length).toBe(3)
  })

  test('the first ressource is about Bravosi recipes', async () => {
    const response = await api.get('/api/ressources')

    expect(response.body[0].title).toBe('Bravosi recipes')
  })

  test('a specific ressource can be viewed', async () => {
    const ressourcesAtStart = await helper.ressourcesInDb()

    const ressourceToView = ressourcesAtStart[0]

    const resultRessource = await api
      .get(`/api/ressources/${ressourceToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultRessource.body).toEqual(ressourceToView)
  })
})

describe('manipulating ressources', () => {
  test('ressource without title is not added', async () => {
    const newRessource = {
      author: 'Barrew Garrison',
      url: 'https://fullstackopen.com/'
    }

    await api
      .post('/api/ressources')
      .send(newRessource)
      .expect(400)

    const response = await api.get('/api/ressources')

    expect(response.body.length).toBe(helper.initialRessources.length)
  })

  test('a ressource can be deleted', async () => {
    const ressourcesAtStart = await helper.ressourcesInDb()
    const ressourceToDelete = ressourcesAtStart[0]

    await api
      .delete(`/api/ressources/${ressourceToDelete.id}`)
      .expect(204)

    const ressourcesAtEnd = await helper.ressourcesInDb()

    expect(ressourcesAtEnd.length).toBe(
      helper.initialRessources.length - 1
    )

    const titles = ressourcesAtEnd.map(r => r.title)

    expect(titles).not.toContain(ressourceToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
