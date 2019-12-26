const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Gantt = new Schema({
  _id:String,
  project:String,
  name:String,
  start:String,
  duration:String,
  parent:String,
})

module.exports = Mongoose.model('Gantt',Gantt)