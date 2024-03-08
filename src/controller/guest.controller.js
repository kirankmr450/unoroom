var mongoose = require('mongoose');
var GuestModel = require('../model/guest.model')

exports.create = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    if (!req.body.firstname) {
        return res.status(400)
            .json({"error": "Mandatory field 'firstname' missing."})
    }
    if (!req.body.emailid) {
        return res.status(400)
            .json({"error": "Mandatory field 'emailid' missing."})
    }
    var guestDoc = new GuestModel({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        passportid: req.body.passportid,
        passportexpiry: req.body.passportexpiry,
        nationality: req.body.nationality,
        emailid: req.body.emailid,
        phonenumber1: req.body.phonenumber1,
        phonenumber2: req.body.phonenumber2,
        address: req.body.address
    });
    guestDoc.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(500).json({"error": "Error creating guest."});
            }
            return res.status(201).send(doc);
    }).catch(err => {
        // Email id is unique in the table. 
        // Handle duplicate email error message.
        if (err.code === 11000) return res.status(409).json({"error": "Duplicate email id."});
        // Handle scenario when certain parameter type is incorrect.
        if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
        return res.status(500).json(err);
    });
}


exports.update = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    // If 'firstname' is provided, it must not be empty string.
    if (req.body.firstname !== undefined &&
        !req.body.firstname) {
        return res.status(400)
            .json({"error": "Mandatory field 'firstname' cannot be empty."})
    }
    // If 'emailid' is provided, it must not be empty string.
    if (req.body.emailid !== undefined &&
        !req.body.emailid) {
        return res.status(400)
            .json({"error": "Mandatory field 'emailid' cannot be empty."})
    }
    
    GuestModel.findOne({_id: req.params.guestid})
        .then(guest => {
            if (!guest) throw { code: 404 };
            Object.assign(guest, req.body);
            return guest.save();
        }).then(guest => {
            return res.status(200).send(guest);
        }).catch(err => {
            console.log(err);
            if (err.code === 404) return res.status(404).json({'error': 'Guest does not exist.'});
            // Email id is unique in the table. 
            // Handle duplicate email error message. 
            if (err.code === 11000) return res.status(409).json({'error': 'Duplicate email id.'});
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}

exports.list = function(req, res) {
    if (req.params.guestid) {
        GuestModel.findOne({_id: req.params.guestid})
            .lean()
            .then(guest => {
                if (!guest) return res.status(404).json({"error": "Guest does not exist."});
            
                return res.status(200).send(guest); 
            }).catch(err => {
                if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
                return res.status(500).send({"error": "Server error"});
            });
    } else {
        GuestModel.find(getFilter(req.query))
            .sort({ createdOn: 'desc'})
            .limit(10)
            .lean()
            .exec()
            .then(guests => {
                res.status(200).send(guests);
            }).catch(err => {
                return res.status(500).send({"error": "Server error"});
            });
    }
}

function getFilter(query) {
    // Individual QSP items and 'AND'ed
    var qsp = {};
    // QSP: name
    // Searches in both firstname and lastname field
    if (query.name) {
        Object.assign(qsp, {$or: [{firstname: query.name}, {lastname: query.name}]});
    }
    //QSP: phonenumber
    // Searches in both phonenumber1 and phonenumber2 field
    if(query.phonenumber) {
        Object.assign(qsp, {$or: [{phonenumber1: query.phonenumber}, {phonenumber2: query.phonenumber}]});
    }
    //QSP: passportid
    // Searches passportid
    if(query.passportid) {
        Object.assign(qsp, {passportid: query.passportid});
    }
    // QSP: emailid
    // Searches emailid
    if(query.emailid) {
        Object.assign(qsp, {emailid: query.emailid});
    }
    return qsp;
    
    // Case insensitive search
//    var string = "SomeStringToFind";
//    var regex = new RegExp(["^", string, "$"].join(""), "i");
//    // Creates a regex of: /^SomeStringToFind$/i
//    db.stuff.find( { foo: regex } );
}

exports.delete = function(req, res) {
    GuestModel.findOneAndRemove({_id: req.params.guestid})
        .then(guest => {
            if (!guest) return res.status(404).json({"error": "Guest does not exist."});

            return res.status(200).send(guest);
        }).catch(err => {
           return res.status(500).send({"error": "Server error"}); 
        });
}

exports.checkIfGuestExist = function(guestId) {
    return new Promise((resolve, reject) => {
        GuestModel.findOne(
            {_id: mongoose.Types.ObjectId(guestId)}, '_id')
        .then(guestId => {
            if (!guestId) return reject({error: 'Guest does not exist.'});
            return resolve(true); 
        }).catch(err => {
            if (err.name == 'CastError') return reject({error: 'Cast Error.'});
            return reject({error: 'Internal Server Error.'});
        });
    });
}
