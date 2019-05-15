var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var occupiedRoomSchema = new Schema({
    reservationid: Schema.Types.ObjectId,
    roomid: Schema.Types.ObjectId,
    guestid: Schema.Types.ObjectId,
    checkindate: Date,
    checkoutdate: Date
});


module.exports = mongoose.model('OccupiedRoom', occupiedRoomSchema);