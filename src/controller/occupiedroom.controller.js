var mongoose = require('mongoose');
var moment = require('moment');
var OccupiedRoom = require('../model/occupiedroom.model');

exports.create = (req, res) => {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    
    var checkindate = moment(req.body.checkindate, moment.ISO_8601).toDate();
    var checkoutdate = moment(req.body.checkoutdate, moment.ISO_8601).toDate();
    console.log(checkindate);
    console.log(checkoutdate);
    
    var record = new OccupiedRoom({
        reservationid: mongoose.Types.ObjectId(req.body.reservationid),
        roomid: mongoose.Types.ObjectId(req.body.roomid),
        guestid: mongoose.Types.ObjectId(req.body.guestid),
        checkindate: checkindate,
        checkoutdate: checkoutdate
    });
    record.save()
    .then(doc => {
        if (!doc || doc.lenngth === 0) {
            return res.status(201).send(doc);
        }
        return res.status(200).send(doc);
    }).catch(err => {
        return res.status(500).json(err);
    });
}

exports.list = (req, res) => {
    var qsp = {};
    if (req.query.id) 
        Object.assign(qsp, {"_id": req.query.id});
    if (req.query.reservationid) 
        Object.assign(qsp, {"reservationid": req.query.reservationid});
    if (req.query.roomid)
        Object.assign(qsp, {"roomid": req.query.roomid});
    if (req.query.guestid)
        Object.assign(qsp, {"guestid": req.query.guestid});
    if (req.query.checkin)
        Object.assign(qsp, getCheckinDateQSP(req.query.checkin));
    
    console.log(qsp);
    OccupiedRoom
        .find(qsp)
        .sort({ createdOn: 'desc'})
        .limit(20)
        .exec((err, results) => {
            res.status(200).send(results);
        });
}

function getCheckinDateQSP(checkInDate) {
    var qsp = {};
    var checkindate = moment(checkInDate, moment.ISO_8601).toDate();
    return qsp;
} 

exports.delete = (req, res) => {
    if (!req.params.id) {
        res.status(400).send("Missing URL parameter: occupancyId");
    } else {
        OccupiedRoom.findOneAndRemove({"_id": req.params.id})
        .then(doc => {
            console.log(doc);
            return res.status(200).send("");
        })
        .catch(err => {
           return res.status(404).send("Item not found.");
        });
    }
}

