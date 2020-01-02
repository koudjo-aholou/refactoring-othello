const Board = require('../models/board')

exports.getAll = async (req, res) => {
  const allBoards = await Board.find({})
  res.json(allBoards.map(board => board.toJSON()))
}

exports.getOne = async (req, res, next) => {
  try {
    const foundboard = await Board.findById(req.params.id)
    if (foundboard) {
      res.json(foundboard.toJSON())
    } else {
      res.status(404).end()
    }
  } catch (e) {
    next(e)
  }
}

exports.create = async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    const newBoard = new Board({ ...req.body, turn: 'black' })

    const savedBoard = await newBoard.save()
    res.json(savedBoard.toJSON())
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  Board.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedBoard => {
      res.json(updatedBoard.toJSON())
    })
    .catch(error => next(error))
}

exports.remove = async (req, res, next) => {
  try {
    await Board.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
}
