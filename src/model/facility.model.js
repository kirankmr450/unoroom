var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requiredStringValidator = [
    function (val) {
        var testVal = val.trim();
        return (testVal.length > 0);
    }, 
    '{PATH} cannot be empty'
];

var imgSchema = new Schema({
    category: String,
    description: String,
    mimetype: String,
    url: String,
    thumbnail: Buffer
});

var roomSchema = new Schema({
    name: [String],
    type: String,
    furnishing: String,
    size: String,
    view: String,
    amenities: [String],
    price: Number,
    count: Number,
    images: [imgSchema]
});

var nearybySchema = new Schema({
    name: {
        type: String,
        required: true 
    },
    locationtype: {
        type: String,
        required: false
    },
    location: {
        latitude: {
            type: Number,
            required: false    
        },
        longitude: {
            type: Number,
            required: false
        }
    },
    distanceinmeters: {
        type: Number,
        required: false
    }
});

var facilitySchema = new Schema({
    facilityid: {
        type: String,
        required: false,
    },
    name: {
        type: String, 
        required: true,
        validate: requiredStringValidator
    },
    description: {
        type: String,
        required: false
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
    emailid: {
        type: String,
        required: false
    },
    amenities: {
        type: [String],
        required: false
    },
    buildingtype: {
        type: String,
        required: true,
    },
    nearby: [nearybySchema],
    images: [imgSchema],
    rules: [String],
    rooms: [roomSchema],
    roomtypes: [String],
    status: String,
    address: {
        line1: {
            type: String,
            required: false
        },
        line2: {
            type: String, 
            required: false
        },
        locality: {
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
        state: {
            type: String
        },
        country: {
            type: String,
            required: false
        },
        location: {
            latitude: {
                type: Number,
                required: false    
            },
            longitude: {
                type: Number,
                required: false
            }
        },
        required: false
    }
});

facilitySchema.index({ name: 'text' });
module.exports = mongoose.model('Facility', facilitySchema);