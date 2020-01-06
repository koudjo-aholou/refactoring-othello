const usersRouter = require('express').Router()
const userController = require('../controllers/userController')

usersRouter.get('/', userController.getAll)

usersRouter.get('/:id', userController.getOne)

usersRouter.post('/', userController.create)

usersRouter.put('/:id', userController.update)

usersRouter.delete('/:id', userController.remove)

module.exports = usersRouter
