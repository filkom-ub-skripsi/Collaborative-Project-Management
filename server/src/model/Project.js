const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const Project = new Schema({
  _id:String,
  organization:String,
  employee:String,
  client:String,
  code:String,
  name:String,
  start:String,
  end:String,
  problem:String,
  goal:String,
  objective:String,
  success:String,
  obstacle:String,
  status:String,
})

module.exports = Mongoose.model('Project',Project)