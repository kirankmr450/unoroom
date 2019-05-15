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
        if (err.code === 11000) return res.status(409).json({"error": "Duplicate email id."});
        return res.status(500).json(err);
    });
}


exports.update = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    if (req.body.firstname !== undefined &&
        !req.body.firstname) {
        return res.status(400)
            .json({"error": "Mandatory field 'firstname' cannot be empty."})
    }
    if (req.body.emailid !== undefined &&
        !req.body.emailid) {
        return res.status(400)
            .json({"error": "Mandatory field 'emailid' cannot be empty."})
    }
    GuestModel.findOne({_id: req.params.guestid})
        .then(guest => {
            if (!guest) return res.status(404).json({"error": "Guest does not exist."});
        
            Object.assign(guest, req.body);
            return guest.save();
        }).then(guest => {
            return res.status(200).send(guest);
        }).catch(err => {
            console.log(err);
            if (err.code === 11000) return res.status(409).json({"error": "Duplicate email id."});
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
            });
    } else {
        GuestModel.find().sort({ createdOn: 'desc'})
            .limit(10)
            .lean()
            .exec()
            .then(guests => {
                res.status(200).send(guests);
            });
    }
}

exports.delete = function(req, res) {
    GuestModel.findOneAndRemove({"_id": req.params.guestid})
        .then(guest => {
            if (!guest) return res.status(404).json({"error": "Guest does not exist."});

            return res.status(200).send(guest);
        }).catch(err => {
           return res.status(500).send({"error": "Server error"}); 
        });
}