var Guest = require('../model/guest.model')

exports.create = function(req, res) {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    var record = new Guest({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        passportid: req.body.passportid,
        passportexpiry: req.body.passportexpiry,
        nationality: req.body.nationality,
        emailid: req.body.emailid,
        phonenumber1: req.body.phonenumber1,
        phonenumber2: req.body.phonenumber2
    });
    record.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(201).send(doc);          
            }
            return res.status(200).send(doc);
    }).catch(err => {
        return res.status(500).json(err);
    });
}

exports.list = function(req, res) {
    if (req.params.id) {
        Guest.find({"_id": req.params.id})
            .exec((err, results) => {
                res.status(200).send(results); 
            });
    } else {
        Guest.find().sort({ createdOn: 'desc'})
            .limit(10)
            .exec((err, results) => {
                res.status(200).send(results); 
        });
    }
    
}