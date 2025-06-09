const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'length should be atleast 3 characters, got {VALUE}']
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message : (props) => `${props.value} is not a valid phone number`
    },
    minLength: [9, 'phone number should have atleast 8 digits, got {VALUE}'],
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)