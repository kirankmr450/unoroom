var mongoose = require('mongoose');
var moment = require('moment');
var ReservationModel = require('../model/reservation.model')
var FacilityCtrl = require('../controller/facility.controller')
var GuestCtrl = require('../controller/guest.controller')

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
        .then(() => FacilityCtrl.checkIfRoomExist(req.body.facilityid, req.body.rooms))
        .catch(err => { throw err; })
        .then(isRoomsExist => {
            console.log(isRoomsExist);
        
            var checkindate = moment(req.body.checkindate, moment.ISO_8601).toDate();
            var checkoutdate = moment(req.body.checkoutdate, moment.ISO_8601).toDate();
            var reservationDocument = new ReservationModel({
                guestid: mongoose.Types.ObjectId(req.body.guestid),
                facilityid: mongoose.Types.ObjectId(req.body.facilityid),
                checkindate: checkindate,
                checkoutdate: checkoutdate,
                status: req.body.status,
                totalprice: req.body.totalprice,
                specialrequest: req.body.specialrequest,
                payment: req.body.payment
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
            .limit(10)
            .lean()
            .exec()
            .then(reservations => {
                res.status(200).send(reservations);
            }).catch(err => {
                return res.status(500).send({"error": "Server error"});
            });
    }
}

function getFilter(query) {
    var qsp = {};
    if (query.guestid) {
        Object.assign(qsp, {guestid: query.guestid});
    }
    if(query.facilityid) {
        Object.assign(qsp, {facilityid: query.facilityid});
    }
    return qsp;
}

exports.delete = (req, res) => {
    ReservationModel
        .findOneAndRemove({_id: req.params.reservationid})
        .then(rsv => {
            if (!rsv) 
                return res.status(404).json({"error": "Reservation does not exist."});

            return res.status(200).send(rsv);
        }).catch(err => {
           return res.status(500).send({"error": "Server error"}); 
        });
}