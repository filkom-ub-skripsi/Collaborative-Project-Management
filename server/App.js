const Express = require('express')
const GraphQLHTTP = require('express-graphql')
const Mongoose = require('mongoose')
const Cors = require('cors')
const App = Express()

const Schema = require('./Schema')

App.use(Cors())
App.use('/graphql', GraphQLHTTP({schema:Schema,graphiql:true}))
App.listen(process.env.PORT || 4000, () => { console.log('Listening at port 4000') })

Mongoose.connect('mongodb://root:eJJjuDwVg8EqP*Yv7J@103.129.221.16:27017/collaborative-project-manager?authSource=admin&retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false})
Mongoose.connection.once('open', () => { console.log('Conneted to database\n') })
