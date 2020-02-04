const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 3
  },
  passwordHash: {
    type: String,
    minlength: 3
  },
  boards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board'
    }
  ]
})

userSchema.plugin(uniqueValidator)

// returnedObject creer une nouvelle propriété dans l objet nommée id  et conversion de l id en string
// obliger de convertir car find ne marche pas sur un object id qui n est pas une string
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
