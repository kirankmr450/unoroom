var Facility = require('../model/facility.model');

exports.listFacility = function(req, res) {
    if (req.params.facilityid) {
        Facility.find({"_id": req.params.facilityid})
            .exec((err, results) => {
                res.status(200).send(results); 
            });
    } else {
        Facility.find().sort({ createdOn: 'desc'})
            .limit(10)
            .exec((err, results) => {
                res.status(200).send(results); 
        });
    }
}


exports.createFacility = function(req, res) {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    var facilityDoc = new Facility({
        name: req.body.name,
        phonenumber1: req.body.phonenumber1,
        phonenumber2: req.body.phonenumber2,
        amenities: req.body.amenities,
        rules: req.body.rules,
        rooms: req.body.rooms,
        roomtypes: req.body.roomtypes,
        address: req.body.address
    });
    facilityDoc.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(201).send(doc);          
            }
            return res.status(200).send(doc);
    }).catch(err => {
        return res.status(500).json(err);
    });
}

exports.updateFacility = function(req, res) {
    if (!req.params.facilityid) 
        return res.status(400).send("Facility Id Missing");
    
    Facility.findOne({_id: req.params.id}, 
                     (err, facility) => {
        
        if (err || !facility) return res.status(404).send(err);
        
        Object.assign(facility, req.body);
        facility.save()
            .then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(200).send(doc);
            }
            return res.status(200).send(doc);
        }).catch(err => {
           return res.status(500).json(err); 
        });
    });
}

exports.deleteFacility = function(req, res) {
    if (!req.params.facilityid) {
        res.status(400).send("Missing URL parameter: userId");
    } else {
        Facility.findOneAndRemove({"_id": req.params.facilityid})
        .then(doc => {
            console.log(doc);
            return res.status(200).send("");
        })
        .catch(err => {
           return res.status(404).send("Item not found"); 
        });
    }
}

exports.createRoom = function(req, res) {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    
    Facility.findOne({_id: req.params.id}, 
                     (err, facility) => {
        if (err || !facility) return res.status(404).send(err);
        
        facility.rooms.push(req.body);
        facility.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(200).send(doc);
            }
            return res.status(200).send(doc);
        }).catch(err => {
           return res.status(500).json(err); 
        });
    });
}




exports.getRoomTypes = function(req, res) {
    return res.status(200).send(JSON.stringify(roomTypes));
}

exports.getBuildingAmenities = function(req, res) {
    return res.status(200).send(JSON.stringify(buildingAmenities));
}

exports.getRoomAmenities = function(req, res) {
    return res.status(200).send(JSON.stringify(roomAmenities));
}

var roomTypes = ["SingleRoomApt", "DoubleRoomApt", "Villa", "ServiceApt", "Hotel"];

var buildingAmenities = ["SwimmingPool", "Internet", "CarPark", "AirportTransfer", "Gym", "FrontDesk", "Spa", "Sauna", "Restaurant", "SmokingArea", "PetsAllowed", "Nightclub", "DisableFriendly", "BusinessFriendly"];

var roomAmenities = ["AirConditioning", "NonSmoking", "Smoking", "Bathtub", "Kitchen", "PrivatePool", "TV", "Balcony", "Terrace", "CoffeeMaker", "Refrigerator", "WashingMachine", "Heating", "PetsAllowed", "SemiFurnished", "FullyFurnished"];