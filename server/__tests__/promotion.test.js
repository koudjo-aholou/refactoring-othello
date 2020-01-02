const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Promotion = require('../models/promotion')

const api = supertest(app)

const promotionsInDb = async () => {
  const promotions = await Promotion.find({})
  return promotions.map(promotion => promotion.toJSON())
}

beforeEach(async () => {
  await Promotion.deleteMany({})

  for (const promotion of helper.initialmodules) {
    const promotionObject = new Promotion(promotion)
    await promotionObject.save()
  }
})

describe('fetching promotions', () => {
  test('promotions are returned as json', async () => {
    await api
      .get('/api/promotions')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all promotions are returned', async () => {
    const response = await api.get('/api/promotions')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('there are three promotions', async () => {
    const response = await api.get('/api/promotions')

    expect(response.body.length).toBe(3)
  })

  test('the first promotion has placeholder title', async () => {
    const response = await api.get('/api/promotions')

    expect(response.body[0].title).toBe('placeholder title')
  })

  test('a specific promotion can be viewed', async () => {
    const promotionsAtStart = await promotionsInDb()

    const promotionToView = promotionsAtStart[0]

    const resultPromotion = await api
      .get(`/api/promotions/${promotionToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultPromotion.body).toEqual(promotionToView)
  })
})

describe('manipulating promotions', () => {
  test('a valid promotion can be added', async () => {
    const newPromotion = {
      title: 'async/await simplifies making async calls'
    }

    await api
      .post('/api/promotions')
      .send(newPromotion)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/promotions')
    const titles = response.body.map(r => r.title)
    expect(response.body.length).toBe(helper.initialmodules.length + 1)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('promotion without title is not added', async () => {
    const newPromotion = {}

    await api
      .post('/api/promotions')
      .send(newPromotion)
      .expect(400)

    const response = await api.get('/api/promotions')

    expect(response.body.length).toBe(helper.initialmodules.length)
  })

  test('a promotion can be deleted', async () => {
    const promotionsAtStart = await promotionsInDb()
    const promotionToDelete = promotionsAtStart[0]

    await api
      .delete(`/api/promotions/${promotionToDelete.id}`)
      .expect(204)

    const promotionsAtEnd = await promotionsInDb()

    expect(promotionsAtEnd.length).toBe(
      helper.initialmodules.length - 1
    )

    const titles = promotionsAtEnd.map(r => r.title)

    expect(titles).not.toContain(promotionToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
