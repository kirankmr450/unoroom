var fs = require('fs');
var FacilityModel = require('../model/facility.model');
var MetaModel = require('../model/meta.model');
var _ = require('lodash/array');

exports.createFacility = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({'error': 'Request body is missing'});
    }
    if (!req.body.name) {
        return res.status(400)
            .json({'error': "Mandatory field 'name' missing."})
    }
    // Ensure all entries in amenities belong to
    // meta.model.buildingAmenities
    if (isInvalidBuildingAmenities(req.body.amenities)) {
        return res.status(400)
        .json({'error': 'Invalid amenities in the amenity list'});
    }
    var facilityDoc = new FacilityModel({
        name: req.body.name,
        phonenumber1: req.body.phonenumber1,
        phonenumber2: req.body.phonenumber2,
        emailid: req.body.emailid,
        amenities: _.uniq(req.body.amenities),
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

var isInvalidBuildingAmenities = (amenities) => {
    var diff = _.difference(amenities, MetaModel.buildingAmenities);
    if (diff.length > 0) return true;
    return false;
}

exports.updateFacility = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": 'Request body is missing'});
    }
    // If 'name' is provided, it must not be empty string.
    if (req.body.name !== undefined &&
        !req.body.name) {
        return res.status(400)
            .json({"error": "Mandatory field 'name' cannot be empty."})
    }
    // Ensure all entries in amenities belong to
    // meta.model.buildingAmenities
    if (isInvalidBuildingAmenities(req.body.amenities)) {
        return res.status(400)
        .json({'error': 'Invalid amenities in the amenity list'});
    }
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw { code: 404 };
        
            Object.assign(facility, req.body);
            return facility.save();
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            if (err.code === 404) return res.status(404).json({'error': 'Facility does not exist.'});
        
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
        FacilityModel.find(getFacilityFilter(req.query))
            .sort({ createdOn: 'desc'})
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

var getFacilityFilter = (query) => {
    // Individual QSP fields are 'AND'ed
    var qsp = {};
    // QSP: city=<comma-separated-cities> (bangalore,ahmedabad)
    // Each city name is 'OR'ed.
    // i.e. Returns facilities in any of those cities.
    if (query.city) {
        Object.assign(qsp, {'address.city': {$in: query.city.split(',')}});
    }
    //QSP: amenities=<amenity-name>
    //One can specify multiple amenities field in QSP
    //Returns facility which has all the amenities specified.
    if (query.amenities) {
        if (typeof query.amenities === 'string') {
            query.amenities = [query.amenities];
        }
        Object.assign(qsp, {amenities: {$all: query.amenities}});
    }
    //QSP: roomtype=<room-type>
    //Returns all amenities which has at-least one room of this type
    if (query.roomtype) {
        Object.assign(qsp, {'rooms.type': query.roomtype});
    }
    return qsp;
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
    // Ensure all entries in amenities belong to
    // meta.model.roomAmenities
    if (isInvalidRoomAmenities(req.body.amenities)) {
        return res.status(400)
        .json({'error': 'Invalid amenities in the amenity list'});
    }
    // Ensure room type belong to meta.model.roomTypes
    if (isInvalidRoomType(req.body.type)) {
        return res.status(400).json({'error': 'Invalid room type'});
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
    // Ensure all entries in amenities belong to
    // meta.model.roomAmenities
    if (isInvalidRoomAmenities(req.body.amenities)) {
        return res.status(400)
        .json({'error': 'Invalid amenities in the amenity list'});
    }
    // Ensure room type belong to meta.model.roomTypes
    if (isInvalidRoomType(req.body.type)) {
        return res.status(400).json({'error': 'Invalid room type'});
    }
    // First, look up the facility
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw { code: 404 };
        
            for (roomIndex in facility.rooms) {
                if (facility.rooms[roomIndex]._id == req.params.roomid) {
                    Object.assign(facility.rooms[roomIndex], req.body);
                    return facility.save();        
                }
            }
            
            throw { code: 4041 };
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            if (err.code === 404) return res.status(404).json({'error': 'Facility does not exist.'});
            if (err.code === 4041) return res.status(404).json({'error': 'Room does not exist.'});
    
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}

var isInvalidRoomAmenities = (amenities) => {
    var diff = _.difference(amenities, MetaModel.roomAmenities);
    if (diff.length > 0) return true;
    return false;
}

var isInvalidRoomType = (roomType) => {
    return ((MetaModel.roomTypes.indexOf(roomType)) === -1);
}

exports.deleteRoom = function(req, res) {
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw {code: 404};
        
            facility.rooms = facility.rooms.filter(room => room._id != req.params.roomid);
            return facility.save();
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
        
            if (err.code === 404) return res.status(404).json({'error': 'Facility does not exist.'});
        
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}
