const Board = require('../models/board')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

exports.getAll = async (req, res) => {
  const allBoards = await Board.find({}).populate('users')
  res.json(allBoards.map(board => board.toJSON()))
}

exports.getOne = async (req, res, next) => {
  try {
    const foundboard = await Board.findById(req.params.id).populate('users')
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
  const token = getTokenFrom(req)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const newBoard = new Board({
      ...req.body,
      turn: 'black',
      users: user._id,
      blackscore: 2,
      whitescore: 2
    })

    const savedBoard = await newBoard.save()
    user.boards = user.boards.concat(savedBoard._id)
    await user.save()
    res.json(savedBoard.toJSON())
  } catch (e) {
    next(e)
  }
}

exports.update = async (req, res, next) => {
  Board.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedBoard => {
      console.log(updatedBoard, 'updateBoard========')
      res.json(updatedBoard.toJSON())
    })
    .catch(error => next(error))
}

exports.update = async (req, res, next) => {
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if(err){
      return res.status(401).json({ error: "Votre token d'authentification est manquant. Veuillez vous reconnecter." })
    }
    else{
      return decoded
    }
  });


  // try empechait la condition de s executer
  try {
    const boardToUpdate = await Board.findById(req.params.id)
    const user = await User.findById(decodedToken.id)
    console.log(user, "user ===========")
    if (user === null || !boardToUpdate.users.includes(user._id)) {

      return res.status(401).json({ error: "Vous n'avez pas le droit de jouer sur cette partie." })
    }
    const updatedBoard = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedBoard.toJSON())
  } catch (e) {
    console.log(e.message)
    next(e)
  }
}

exports.remove = async (req, res, next) => {
  try {
    await Board.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
}
