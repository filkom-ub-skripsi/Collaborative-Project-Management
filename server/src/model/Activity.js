const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Activity = new Schema({
  _id:String,
  project:String,
  code:String,
  detail:String,
  date:String,
})

module.exports = Mongoose.model('Activity',Activity)