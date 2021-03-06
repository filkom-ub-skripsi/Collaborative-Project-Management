const convict = require('convict')
const mongoUriFormat = require('./format/mongo-uri')
require('dotenv').config()
convict.addFormat(mongoUriFormat)

const config = convict({
    env: {
        doc: 'Environment application.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV'
    },
    mongo: {
        uri: {
            doc: 'mongo uri.',
            format: 'mongo-uri',
            default: 'mongodb://localhost',
            env: 'MONGO_URI'
        }
    }
})

// validation
config.validate({
    allowed: 'strict'
})

module.exports = config