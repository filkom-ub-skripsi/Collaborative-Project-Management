const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Division = new Schema({
  _id:String,
  organization:String,
  name:String
})

module.exports = Mongoose.model('Division',Division)