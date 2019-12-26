const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Sprint = new Schema({
  _id:String,
  project:String,
  name:String,
  start:String,
  end:String,
})

module.exports = Mongoose.model('Sprint',Sprint)