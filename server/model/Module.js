const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Module = new Schema({
  _id:String,
  project:String,
  name:String,
  detail:String
})

module.exports = Mongoose.model('Module',Module)