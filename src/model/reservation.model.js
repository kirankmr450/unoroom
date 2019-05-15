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
    checkindate: Date,
    checkoutdate: Date,
    status: String,
    totalprice: Number,
    specialrequest: String,
    payment: String,
    rooms: [bookedroomSchema]
});

module.exports = mongoose.model('Reservation', reservationSchema);