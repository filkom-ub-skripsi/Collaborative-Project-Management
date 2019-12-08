const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Requirement = new Schema({
  _id:String,
  project:String,
  module:String,
  name:String,
  detail:String,
  status:String
})

module.exports = Mongoose.model('Requirement',Requirement)