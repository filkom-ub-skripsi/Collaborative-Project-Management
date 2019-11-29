const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Organization = new Schema({
  _id:String,
  name:String,
})

module.exports = Mongoose.model('Organization',Organization)