var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requiredStringValidator = [
    function (val) {
        var testVal = val.trim();
        return (testVal.length > 0);
    }, 
    '{PATH} cannot be empty'
];


var guestSchema = new Schema({
    firstname: {
        type: String, 
        required: true,
        validate: requiredStringValidator
    },
    lastname: {
        type: String,
        required: false
    },
    passportid: {
        type: String,
        required: false
    },
    passportexpiry: {
        type: Date,
        required: false
    },
    nationality: {
        type: String,
        required: false
    },
    emailid: {
        type: String,
        required: true,
        unique: true,
        validate: requiredStringValidator
    },
    phonenumber1: {
        type: String,
        required: true,
        validate: requiredStringValidator
    },
    phonenumber2: {
        type: String,
        required: false
    },
    address: {
        line1: {
            type: String,
            required: false
        },
        line2: {
            type: String, 
            required: false
        },
        city: {
            type: String,
            required: false
        },
        pin: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        },
        required: false
    }
});

module.exports = mongoose.model('Guest', guestSchema);