const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')

describe('Contract with model USER', () => {
  test('Has property "id" in the response ', async () => {
    const jsonData = await api.get('/api/users')
    expect(jsonData.body[0]).toHaveProperty('id')
  })

  test('Property "id" is a String', async () => {
    const jsonData = await api.get('/api/users')
    expect(typeof jsonData.body[0].id).toBe('string')
  })

  test('Property "id" not be null or empty', async () => {
    const jsonData = await api.get('/api/users')
    expect(jsonData.body[0].id).not.toEqual('')
    expect(jsonData.body[0].id).not.toEqual(' ')
    expect(jsonData.body[0].id).not.toEqual(null)
    expect(jsonData.body[0].id.length).not.toEqual(0)
  })

  test('Has property "boards" in the response ', async () => {
    const jsonData = await api.get('/api/users')
    expect(jsonData.body[0]).toHaveProperty('boards')
  })

  test('Property "boards" is an Array ', async () => {
    const jsonData = await api.get('/api/users')
    expect(Array.isArray([jsonData.body[0].boards]))
  })

  test('has 3 properties', async () => {
    const jsonData = await api.get('/api/users')
    const size = Object.keys(jsonData.body[0]).length
    expect(size).toEqual(3)
  })

  test('Has property "username" in the response ', async () => {
    const jsonData = await api.get('/api/users')
    expect(jsonData.body[0]).toHaveProperty('username')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
