const bcrypt = require('bcryptjs')
const User = require('../models/user')

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', { title: 1, likes: 1 })
    await res.json(users.map(u => u.toJSON()))
  } catch (error) {
    next(error)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const founduser = await User.findById(req.params.id)
    if (founduser) {
      res.json(founduser.toJSON())
    } else {
      res.status(404).end()
    }
  } catch (e) {
    next(e)
  }
}

exports.create = async (request, response, next) => {
  try {
    const body = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
}

exports.remove = async (request, response, next) => {
  try {
    await User.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
