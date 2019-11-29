const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Employee = new Schema({
  _id:String,
  password:String,
  organization:String,
  division:String,
  name:String,
  email:String,
  contact:String,
})

module.exports = Mongoose.model('Employee',Employee)