var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var propertyIdSchema = new Schema({
    city: {
        type: String,
        required: false,
        unique: true
    },
    lastindex: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('propertyId', propertyIdSchema);
