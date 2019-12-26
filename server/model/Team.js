const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Team = new Schema({
  _id:String,
  employee:String,
  task:String,
})

module.exports = Mongoose.model('Team',Team)