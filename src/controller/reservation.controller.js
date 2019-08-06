var mongoose = require('mongoose');
var moment = require('moment-timezone');
var ReservationModel = require('../model/reservation.model')
var PropertyCtrl = require('../controller/property.controller')
var GuestCtrl = require('../controller/guest.controller')

const RESERVATION_STATUS_PENDING = 'pending';
const RESERVATION_STATUS_CONFIRMED = 'confirmed';
const RESERVATION_STATUS_CANCELLED = 'cancelled';

exports.create = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    if (!req.body.guestid) {
        return res.status(400)
            .json({"error": "Mandatory field 'guestid' missing."})
    }
    if (!req.body.facilityid) {
        return res.status(400)
            .json({"error": "Mandatory field 'facilityid' missing."})
    }
    if (!req.body.checkindate) {
        return res.status(400)
            .json({"error": "Mandatory field 'checkindate' missing."})
    }
    if (!req.body.checkoutdate) {
        return res.status(400)
            .json({"error": "Mandatory field 'checkoutdate' missing."})
    }
    
    GuestCtrl.checkIfGuestExist(req.body.guestid)
        .catch(err => { throw err; })
        .then(() => PropertyCtrl.checkIfRoomExist(req.body.facilityid, req.body.rooms))
        .catch(err => { throw err; })
        .then(isRoomsExist => {
            
            // Check-in/out Date should only be date and not the time
            // Accepted format is "2019-11-18".
//            console.log('Received: ' + req.body.checkindate + ' ' + req.body.checkoutdate);
            var checkin = moment.tz(req.body.checkindate + ' 12:00', 'Asia/Calcutta');
            var checkout = moment.tz(req.body.checkoutdate + ' 11:59:59.999', 'Asia/Calcutta');
        
//            console.log('Transformed: ' + checkin.format() + ' ' + checkout.format());
//            console.log('Transformed-Date: ' + checkin.toDate() + ' ' + checkout.toDate());
        
            var reservationDocument = new ReservationModel({
                guestid: mongoose.Types.ObjectId(req.body.guestid),
                facilityid: mongoose.Types.ObjectId(req.body.facilityid),
                checkindate: checkin.toDate(),
                checkoutdate: checkout.toDate(),
                status: RESERVATION_STATUS_PENDING,
                totalprice: req.body.totalprice,
                specialrequest: req.body.specialrequest,
                payment: req.body.payment,
                rooms: req.body.rooms
            });
            return reservationDocument.save();
        }).then(reservation => {
            if (!reservation || reservation.length === 0) {
                return res.status(500).json({"error": "Error creating guest."});
            }
            return res.status(201).send(reservation);
        }).catch(err => {
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}


exports.list = (req, res) => {
    if (req.params.reservationid) {
        ReservationModel.findOne({_id: req.params.reservationid})
            .lean()
            .then(reservation => {
                if (!reservation) return res.status(404).json({"error": "Reservation does not exist."});
            
                return res.status(200).send(reservation); 
            }).catch(err => {
                if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
                return res.status(500).send({"error": "Server error"});
            });
    } else {
        ReservationModel.find(getFilter(req.query))
            .sort({ createdOn: 'desc'})
            .lean()
            .exec()
            .then(reservations => {
                res.status(200).send(reservations);
            }).catch(err => {
                return res.status(500).send({"error": "Server error"});
            });
    }
}

// Create QSP from the filters.
// Returns QSP object.
function getFilter(query) {
    var qsp = {};
    if (query.guestid) {
        Object.assign(qsp, {guestid: query.guestid});
    }
    if(query.facilityid) {
        Object.assign(qsp, {facilityid: query.facilityid});
    }
    if (query.checkindate && query.checkoutdate) {
        var checkin = moment.tz(query.checkindate + ' 12:00', 'Asia/Calcutta');
        var checkout = moment.tz(query.checkoutdate + ' 12:00', 'Asia/Calcutta');

        Object.assign(qsp, {$or: [
            {checkindate: {'$lte': checkin}, checkoutdate: {'$gt': checkin}},
            {checkindate: {'$lt': checkout}, checkoutdate: {'$gte': checkout}},
            {checkindate: {'$gt': checkin}, checkoutdate: {'$lt': checkout}}
        ]});
    }
    if (query.roomtype) {
        Object.assign(qsp, {'rooms.type': query.roomtype});
    }
    return qsp;
}


// Fetch reserved room count of a given roomtype in a given facility. 
// Supported query filters:
//   facilityid: <facility-id>
//   checkindate: <checkin-date>
//   checkoutdate: <checkout-date>
//   roomtype: <room-type>
// Returns a promise
exports.fetchReservedRoomCountByRoomType = (query) => {
    var checkin = moment.tz(query.checkindate + ' 12:00', 'Asia/Calcutta');
    var checkout = moment.tz(query.checkoutdate + ' 12:00', 'Asia/Calcutta');
    
    return ReservationModel.aggregate([
        // Filter by facilityid and reservation status
        {$match: {'facilityid': mongoose.Types.ObjectId(query.facilityid),
                  'status': {$ne: RESERVATION_STATUS_CANCELLED}
                 }
        },
        // Unwind rooms array. This create duplicate entry for each item in rooms.
        {$unwind: '$rooms'},
        // Match room type, checkin and checkout dates
        {$match: {'rooms.type': query.roomtype,
                  $or: [{checkindate: {$lte: checkin.toDate()}, checkoutdate: {$gt: checkin.toDate()}}, 
                        {checkindate: {$lt: checkout.toDate()}, checkoutdate: {$gte: checkout.toDate()}}, 
                        {checkindate: {$gt: checkin.toDate()}, checkoutdate: {$lt: checkout.toDate()}}
                       ]
                 }
        },
        // Count room numbers
        {$group: {_id: null, count: {$sum: '$rooms.count'}}},
        // Extract only the count
        {$project: {_id: 0, count: 1}}
    ]).then(res => (res.length === 0) ? 0 : res[0].count);
}


// Fetch all reserved room count in a given facility.
// Supported query filters:
//   facilityid: <facility-id>
//   checkindate: <checkin-date>
//   checkoutdate: <checkout-date>
// Returns a promise
exports.fetchAllReservedRoomCount = (query) => {
    var checkin = moment.tz(query.checkindate + ' 12:00', 'Asia/Calcutta');
    var checkout = moment.tz(query.checkoutdate + ' 12:00', 'Asia/Calcutta');
    
    return ReservationModel.aggregate([
        // Filter by facilityid and reservation status
        {$match: {'facilityid': mongoose.Types.ObjectId(query.facilityid),
                  'status': {$ne: RESERVATION_STATUS_CANCELLED}
                 }
        },
        // Match room type, checkin and checkout dates
        {$match: {$or: [{checkindate: {$lte: checkin.toDate()}, checkoutdate: {$gt: checkin.toDate()}}, 
                        {checkindate: {$lt: checkout.toDate()}, checkoutdate: {$gte: checkout.toDate()}}, 
                        {checkindate: {$gt: checkin.toDate()}, checkoutdate: {$lt: checkout.toDate()}}
                       ]
                 }
        },
        // Unwind rooms array. This create duplicate entry for each item in rooms.
        {$unwind: '$rooms'},
        // Count room numbers
        {$group: {_id: '$rooms.type', count: {$sum: '$rooms.count'}}},
    ]);checkin
}


/**
 * Update a reservation.
 */
exports.update = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    // GuestId cannot be changed.
    if (req.body.guestid !== undefined) {
        return res.status(400)
            .json({"error": "Guest Id cannot be changed"});
    }
    req.status(404).send('This API is not yet supported');
}

/**
 * Confirm a reservation.
 */
exports.confirmReservation = (req, res) => {
    ReservationModel.findOne({_id: req.params.reservationid})
        .then(reservation => {
            if (!reservation) throw {code: 404};
            if (!reservation.rooms || reservation.rooms.length === 0) throw {code: 4001};
            var roomCount = reservation.rooms.reduce((count, room) => count + room.count, 0);
            if (roomCount === 0) throw {code: 4001};
            if (reservation.status === RESERVATION_STATUS_CONFIRMED) throw {code: 4002};
        
            //TODO: Should we check for latest availability before confirmation.
        
            reservation.status = RESERVATION_STATUS_CONFIRMED;
            return reservation.save();
        }).then(reservation => {
            // TODO: Send confirmation mail to the guest.
            
            return res.status(200).send(reservation); 
        }).catch(err => {
            if (err.code === 404) return res.status(404).json({"error": "Reservation does not exist."});
            if (err.code === 4001) return res.status(400).json({'error': 'Reservation cannot be confirmed. It does not have enough rooms.'});
            if (err.code === 4002) return res.status(400).json({'error': 'Reservation is already confirmed.'});
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send({"error": "Server error"});
        });
}


/**
 * Cancel a reservation.
 */
exports.cancelReservation = (req, res) => {
    ReservationModel.findOne({_id: req.params.reservationid})
        .then(reservation => {
            if (!reservation) throw {code: 404};
            if (reservation.status === RESERVATION_STATUS_CANCELLED) throw {code: 4001};
        
            //TODO: Should we check for latest availability before confirmation.
        
            reservation.status = RESERVATION_STATUS_CANCELLED;
            return reservation.save();
        }).then(reservation => {
            // TODO: Send confirmation mail to the guest.
            
            return res.status(200).send(reservation); 
        }).catch(err => {
            if (err.code === 404) return res.status(404).json({"error": "Reservation does not exist."});
            if (err.code === 4001) return res.status(400).json({'error': 'Reservation is already cancelled.'});
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send({"error": "Server error"});
        });
}


// Deleting a reservation
// No longer supported. You may cancel a reservation.
exports.deleteReservation = (req, res) => {
    return res.status(404).json({'error': 'This API is no longer supported. Please consider cancelling a reservation.'});
    
//    ReservationModel
//        .findOneAndRemove({_id: req.params.reservationid})
//        .then(rsv => {
//            if (!rsv) 
//                return res.status(404).json({"error": "Reservation does not exist."});
//
//            return res.status(200).send(rsv);
//        }).catch(err => {
//           return res.status(500).send({"error": "Server error"}); 
//        });
}