const boardsRouter = require('express').Router()
const boardController = require('../controllers/boardController')

boardsRouter.get('/', boardController.getAll)

boardsRouter.get('/:id', boardController.getOne)

boardsRouter.post('/', boardController.create)

boardsRouter.put('/:id', boardController.update)

boardsRouter.delete('/:id', boardController.remove)

module.exports = boardsRouter
