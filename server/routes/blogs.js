const blogsRouter = require('express').Router()
const blogController = require('../controllers/blogController')

blogsRouter.get('/', blogController.getAll)

blogsRouter.get('/:id', blogController.getOne)

blogsRouter.post('/', blogController.create)

blogsRouter.put('/:id', blogController.update)

blogsRouter.delete('/:id', blogController.remove)

module.exports = blogsRouter
