const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
  board: Array,
  turn: String,
  name: String,
  active: {
    type: Boolean,
    default: true
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  blackscore: Number,
  whitescore: Number
})

boardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Board', boardSchema)
