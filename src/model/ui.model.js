var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keyPlacesSchema = new Schema({
    cityname: String,
    placename: String,
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
    imageurl: String
});

var uiContentSchema = new Schema({
    keyplaces: [keyPlacesSchema],
    featuredproperty: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('UIContent', uiContentSchema);
