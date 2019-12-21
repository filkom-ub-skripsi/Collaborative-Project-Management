const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Issue = new Schema({
  _id:String,
  project:String,
  requirement:String,
  employee:String,
  name:String,
  detail:String,
  status:String,
})

module.exports = Mongoose.model('Issue',Issue)