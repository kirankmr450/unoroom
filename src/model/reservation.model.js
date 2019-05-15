var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requiredStringValidator = [
    function (val) {
        var testVal = val.trim();
        return (testVal.length > 0);
    }, 
    '{PATH} cannot be empty'
];

var bookedroomSchema = new Schema({
    type: String,
    count: Number,
    price: Number
});

var reservationSchema = new Schema({
    guestid: Schema.Types.ObjectId,
    facilityid: Schema.Types.ObjectId,
    checkin_date: Date,
    checkout_date: Date,
    status: String,
    totalprice: Number,
    specialrequest: String,
    payment: String,
    rooms: [bookedroomSchema]
});

module.exports = mongoose.model('Reservation', reservationSchema);