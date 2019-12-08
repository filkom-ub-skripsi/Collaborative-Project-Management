const Express = require('express')
const GraphQLHTTP = require('express-graphql')
const Mongoose = require('mongoose')
const Cors = require('cors')
const App = Express()

const Schema = require('./Schema')

App.use(Cors())
App.use('/graphql', GraphQLHTTP({schema:Schema,graphiql:true}))
App.listen(process.env.PORT || 4000, () => { console.log('Listening at port 4000') })

Mongoose.connect('mongodb+srv://usercpm:usercpm@cluster-mt0bh.gcp.mongodb.net/collaborative-project-management?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false})
Mongoose.connection.once('open', () => { console.log('Conneted to database\n') })