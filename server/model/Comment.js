const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Comment = new Schema({
  _id:String,
  issue:String,
  employee:String,
  comment:String,
})

module.exports = Mongoose.model('Comment',Comment)