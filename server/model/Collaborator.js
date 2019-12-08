const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Collaborator = new Schema({
  _id:String,
  project:String,
  employee:String,
  status:String,
})

module.exports = Mongoose.model('Collaborator',Collaborator)