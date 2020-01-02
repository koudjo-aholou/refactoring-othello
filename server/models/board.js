const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
  board: Array,
  turn: 'string',
  active: {
    type: Boolean,
    default: true
  }
})

boardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Board', boardSchema)
