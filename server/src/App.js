const Express = require('express')
const GraphQLHTTP = require('express-graphql')
const Mongoose = require('mongoose')
const Cors = require('cors')
const config = require('./config')
const App = Express()

const Schema = require('./Schema')

App.use(Cors())
App.use('/graphql', GraphQLHTTP({schema:Schema,graphiql:true}))
App.listen(process.env.PORT || 4000, () => { console.log('Listening at port 4000') })
console.log(config.get('mongo.uri'));

Mongoose.connect(config.get('mongo.uri'),{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false})
Mongoose.connection.once('open', () => { console.log('Conneted to database\n') })