const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Board = require('../models/board')

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find({})
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

exports.create = async (req, res, next) => {
  try {
    const body = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()

    res.json(savedUser)
  } catch (exception) {
    next(exception)
  }
}

exports.update = async (req, res, next) => {
  try {
    const boardToUpdate = await Board.findById(req.body.board)
    const userToUpdate = await User.findById(req.params.id)
    if (boardToUpdate.users.length < 2 && !boardToUpdate.users.includes(userToUpdate._id)) {
      boardToUpdate.users = boardToUpdate.users.concat(userToUpdate._id)
      await boardToUpdate.save()
    }
    if (!userToUpdate.boards.includes(boardToUpdate._id)) {
      userToUpdate.boards = userToUpdate.boards.concat(req.body.board)
      await userToUpdate.save()
    }
    res.json(userToUpdate.toJSON())
  } catch (e) {
    next(e)
  }
}

exports.remove = async (req, res, next) => {
  try {
    await User.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
