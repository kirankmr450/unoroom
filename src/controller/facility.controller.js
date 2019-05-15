var FacilityModel = require('../model/facility.model');

exports.createFacility = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    if (!req.body.name) {
        return res.status(400)
            .json({"error": "Mandatory field 'name' missing."})
    }
    var facilityDoc = new FacilityModel({
        name: req.body.name,
        phonenumber1: req.body.phonenumber1,
        phonenumber2: req.body.phonenumber2,
        emailid: req.body.emailid,
        amenities: req.body.amenities,
        rules: req.body.rules,
        rooms: req.body.rooms,
        roomtypes: req.body.roomtypes,
        address: req.body.address
    });
    facilityDoc.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(500).json({"error": "Error creating guest."});
            }
            return res.status(201).send(doc);
    }).catch(err => {
        // Handle scenario when certain parameter type is incorrect.
        if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
        return res.status(500).json(err);
    });
}


exports.updateFacility = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    // If 'name' is provided, it must not be empty string.
    if (req.body.name !== undefined &&
        !req.body.name) {
        return res.status(400)
            .json({"error": "Mandatory field 'name' cannot be empty."})
    }
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
        
            Object.assign(facility, req.body);
            return facility.save();
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}


exports.listFacility = function(req, res) {
    if (req.params.facilityid) {
        FacilityModel.findOne({_id: req.params.facilityid})
            .lean()
            .then(facility => {
                if (!facility) return res.status(404).json({"error": "Facility does not exist."});
            
                return res.status(200).send(facility);
            }).catch(err => {
                if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
                return res.status(500).send({"error": "Server error"});
            });
    } else {
        FacilityModel.find().sort({ createdOn: 'desc'})
            .limit(10)
            .lean()
            .exec()
            .then(facilities => {
                res.status(200).send(facilities);
            }).catch(err => {
                return res.status(500).send({"error": "Server error"});
            });
    }
}

exports.deleteFacility = function(req, res) {
    FacilityModel.findOneAndRemove({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) return res.status(404).json({"error": "Facility does not exist."});

                return res.status(200).send(facility);
            }).catch(err => {
               return res.status(500).send({"error": "Server error"}); 
            });
}

exports.createRoom = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
        
            facility.rooms.push(req.body);
            return facility.save();
        }).then(facility => {
            return res.status(201).send(facility);
        }).catch(err => {
            console.log(err);
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}

exports.updateRoom = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    // First, look up the facility
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
        
            for (roomIndex in facility.rooms) {
                if (facility.rooms[roomIndex]._id == req.params.roomid) {
                    Object.assign(facility.rooms[roomIndex], req.body);
                    return facility.save();        
                }
            }
            
            return res.status(404).json({"error": "Room does not exist."});
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}

exports.deleteRoom = function(req, res) {
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
        
            facility.rooms = facility.rooms.filter(room => room._id != req.params.roomid);
            return facility.save();
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}
