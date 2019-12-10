const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Client = new Schema({
  _id:String,
  organization:String,
  name:String,
  email:String,
  contact:String,
  address:String,
})

module.exports = Mongoose.model('Client',Client)