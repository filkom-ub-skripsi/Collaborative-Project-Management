const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Rule = new Schema({
  organization:String,
  leader:String,
})

module.exports = Mongoose.model('Rule',Rule)