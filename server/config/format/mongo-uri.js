const validator = require('validator')
module.exports = {
    name: 'mongo-uri',
    validate: function(val) {
        if (!validator.isURL(val, {protocols: ['mongodb', 'mongodb+srv']})) {
            throw new Error('must be a MongoDB URI');
        }
    }
}
