var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requiredStringValidator = [
    function (val) {
        var testVal = val.trim();
        return (testVal.length > 0);
    }, 
    '{PATH} cannot be empty'
];

var imgItemSchema = new Schema({
    url: String,
    name: String
});

var imageSchema = new Schema({
    category: String,
    description: String,
    urls: [imgItemSchema]
});

var roomSchema = new Schema({
    name: [String],
    type: [String],
    furnishing: String,
    size: String,
    view: String,
    count: Number,
    amenities: [String],
    price: Number,
    images: {
        thumbnails: [String],
        img: [imageSchema]
    }
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
    name: {
        type: String, 
        required: true,
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
    emailid: {
        type: String,
        required: false
    },
    buildingtype: {
        type: String,
        required: false
    },
    amenities: {
        type: [String],
        required: false
    },
    nearby: [nearybySchema],
    images: [imageSchema],
    rules: [String],
    rooms: [roomSchema],
    roomtypes: [String],
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
        locality: {
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

module.exports = mongoose.model('Facility', facilitySchema);