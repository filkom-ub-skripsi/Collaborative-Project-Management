const validator = require('validator')
module.exports = {
    name: 'mongo-uri',
    validate: function(val) {
        if (!validator.isURL(val, {protocols: ['mongodb', 'mongodb+srv'], require_protocol: true, require_tld: false})) {
            throw new Error('must be a MongoDB URI' );
        }
    }
}
