const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Task = new Schema({
  _id:String,
  project:String,
  requirement:String,
  issue:String,
  sprint:String,
  status:String,
})

module.exports = Mongoose.model('Task',Task)