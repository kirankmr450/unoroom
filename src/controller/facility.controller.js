var fs = require('fs');
var resolve = require('path').resolve;
var FacilityModel = require('../model/facility.model');
var MetaModel = require('../model/meta.model');
var PropCtrl = require('./propertyid.controller');
var _ = require('lodash/array');
var Utils = require('../utils/utils');
var ImgUtils = require('../utils/image.utils');

const FACILITY_STATUS_ACTIVE = 'active';
const FACILITY_STATUS_INACTIVE = 'inactive';


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
    // Ensure building type belong to meta.model.buildingTypes
    if (MetaModel.isInvalidBuildingType(req.body.buildingtype)) {
        return res.status(400).json({'error': 'Invalid building type'});
    }
    // Check address and city
    if (!req.body.address || !req.body.address.city) {
        return res.status(400).json({message: 'Mandatory field "city" missing'});
    }
    PropCtrl.getLatestPropertyId(req.body.address.city)
        .then(propertyid => {
            var facilityDoc = new FacilityModel({
                facilityid: propertyid,
                name: req.body.name,
                description: req.body.description,
                phonenumber1: req.body.phonenumber1,
                phonenumber2: req.body.phonenumber2,
                emailid: req.body.emailid,
                amenities: _.uniq(req.body.amenities),
                buildingtype: req.body.buildingtype,
                rules: req.body.rules,
                nearby: req.body.nearby,
                rooms: req.body.rooms,
                address: req.body.address,
                status: FACILITY_STATUS_INACTIVE
            });
            return facilityDoc.save();
        }).then(doc => {
            if (!doc || doc.length === 0) {
                return res.status(500).json({"error": "Error creating guest."});
            }
            return res.status(201).send(doc);
        }).catch(err => {
            // Capture error from getLatestPropertyId()
            if (err === 404) return res.status(404).send({error: 'Invalid city'});
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}


var isInvalidBuildingAmenities = (amenities) => {
    var diff = _.difference(amenities, MetaModel.allAmenities());
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
    // If buildingtype is provided, ensure building type belong to meta.model.buildingTypes
    if (req.body.buildingtype !== undefined && MetaModel.isInvalidBuildingType(req.body.buildingtype)) {
        return res.status(400).json({'error': 'Invalid building type'});
    }
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw { code: 404 };
        
            delete req.body['facilityid'];
            delete req.body['status'];
            delete req.body['images'];
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

// Add image to a facility
exports.uploadFacilityImage = (req, res) => {
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw { code: 404 };
        
            var img = {
                category: req.body.category,
                description: req.body.description,
                mimetype: req.file.mimetype,
                url: ImgUtils.getImageFileUrl(req.params.facilityid, req.file.filename)
            };
            
            facility.images.push(img);
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

// Get facility image
exports.getFacilityImage = (req, res) => {
    var filepath = ImgUtils.getFacilityImageFilePath(req.originalUrl);
    console.log(filepath);
    
    // Handle inexistent file path
    if (!filepath || !fs.existsSync(filepath)) {
        return res.status(404).json({error: 'File does not exist'});
    }
    return res.sendFile(resolve(filepath));
}

// Delete images associated with a facility.
exports.deleteFacilityImage = (req, res) => {
    var filepath;
    
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw { code: 404 };
            
            // Remember the image file name to be removed.
            var img = facility.images.find(image => image._id == req.params.imageid);
            if (!img) throw { code: 4041 };
            filepath = ImgUtils.getFacilityImageFilePath(img.url);
        
            // Update the facility document
            facility.images = facility.images.filter(image => image._id != req.params.imageid);
            return facility.save();
        }).then(res => {
            // Remove the image file
            return Utils.removeDir(filepath);
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            if (err.code === 404) return res.status(404).json({'error': 'Facility does not exist.'});
            if (err.code === 4041) return res.status(404).json({'error': 'Image does not exist in said facility.'});
        
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
            .lean()
            .then(facilities => res.status(200).send(facilities))
            .catch(err => res.status(500).send(err));
    }
}


exports.fetchAllFacilities = (query) => {
    return FacilityModel.find(getFacilityFilter(query))
        .lean().exec();
}

exports.fetchFacilityById = (facilityid) => {
    return FacilityModel.findOne({_id: facilityid}).lean();
}

var getFacilityFilter = (query) => {
    // Individual QSP fields are 'AND'ed
    var qsp = {};
    // QSP: name=<facility-name>/<facilityid>
    if (query.name && typeof query.name === 'string') {
        Object.assign(qsp, {$text: {$search: query.name, $caseSensitive: false}});
    }
    
    // QSP: city=<comma-separated-cities> (bangalore,ahmedabad)
    // Each city name is 'OR'ed. i.e. Returns facilities in any of those cities.
    // 'city' param should be provided only once.
    if (query.city && typeof query.city === 'string') {
        Object.assign(qsp, {'address.city': {$in: query.city.split(',')}});
    }
    //QSP: amenities=<building-amenities>
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
        if (Array.isArray(query.roomtype)) query.roomtype = query.roomtype[0];
        Object.assign(qsp, {'rooms.type': query.roomtype});
    }
    //QSP: ramenities=<room-amenities>
    //One can specify multiple amenities field in QSP
    //Returns facility which has rooms with all of these amenities.
    if (query.ramenities) {
        if (typeof query.ramenities === 'string') {
            query.ramenities = [query.ramenities];
        }
        // $elemMatch enables searching individual room independently.
        // Without it, room amenities are search at facility level, if a facility
        // contains all the room amenities across its room, they are also returned.
        Object.assign(qsp, {'rooms': {$elemMatch: {'amenities': {$all: query.ramenities}}}});
    }
    //QSP: status=active/inactive
    if (query.isActive) {
        Object.assign(qsp, {status: FACILITY_STATUS_ACTIVE});
    }
    return qsp;
}

exports.deleteFacility = function(req, res) {
    res.status(404).json({error: 'This API is no longer supported. Please invoke delist facility API to delist a property.'});
//    FacilityModel.findOneAndRemove({_id: req.params.facilityid})
//        .then(facility => {
//            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
//
//                return res.status(200).send(facility);
//            }).catch(err => {
//               return res.status(500).send({"error": "Server error"}); 
//            });
}

// Delist a facility
exports.delistFacility = (req, res) => {
    return FacilityModel.findByIdAndUpdate(
            req.params.facilityid, 
            {status: FACILITY_STATUS_INACTIVE},
            {new: true}
    ).then(facility => {
        if (!facility) res.status(404).json({error: 'Facility not found.'});
        res.status(200).json(facility);
    }).catch(err => res.status(500).json(err));
}

// Publish a facility
exports.publishFacility = (req, res) => {
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility.rooms || facility.rooms.length === 0) throw {code: 403};
            var roomCount = facility.rooms.reduce((count, room) => count + room.count, 0);
            if (roomCount === 0) throw {code: 403};
        
            facility.status = FACILITY_STATUS_ACTIVE;
            return facility.save();
        })
        .then(facility => res.status(200).send(facility))
        .catch(err => {
            if (err.code === 403) {
                return res.status(403).json({error: 'Facility does not have rooms. It cannot be published.'})
            } else {
                return res.status(500).send(err);
            }
        });
}


exports.checkIfRoomExist = function(facilityId, bookedRooms) {
    return new Promise((resolve, reject) => {
        FacilityModel.findOne({_id: facilityId})
        .then(facility => {
            if (!facility) 
                reject({error: 'Facility does not exist.'});
            
            for (roomIndex in bookedRooms) {
                // Check if the required room type exist
                var room = facility.rooms.find(room => room.type === bookedRooms[roomIndex].type);
                if (!room) reject({error: 'Room type ' + bookedRooms[roomIndex].type + ' does not exist.'});
                
                if (room.count < bookedRooms[roomIndex].count)
                    reject({error: 'Room count exceeds availablity.'});
            }
            resolve(true);
        }).catch(err => {
            if (err.name == 'CastError') reject({error: 'Cast error.'});
            reject({error: 'Internal server error'});
        });
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
    if (MetaModel.isInvalidRoomType(req.body.type)) {
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
    // If room type is provided, ensure room type belong to meta.model.roomTypes
    if (req.body.type !== undefined && MetaModel.isInvalidRoomType(req.body.type)) {
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

/**
 * Delete room under a given facility.
 */
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

/**
 * Add nearyby entry under a given facility.
 */
exports.addNearBy = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    // Ensure nearby type belong to
    // meta.model.locationType
    if (isInvalidNearByType(req.body.locationtype)) {
        return res.status(400)
        .json({'error': 'Invalid location type.'});
    }
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
        
            facility.nearby.push(req.body);
            return facility.save();
        }).then(facility => {
            return res.status(201).send(facility);
        }).catch(err => {
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}

/**
 * Update nearby entry under a given facility
 */
exports.updateNearBy = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    
    // if locationType is provided, ensure nearby type belong to
    // meta.model.locationType
    if (req.body.locationtype !== undefined && isInvalidNearByType(req.body.locationtype)) {
        return res.status(400)
        .json({'error': 'Invalid location type.'});
    }
    
    // First, look up the facility
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw { code: 404 };
        
            for (nearbyIndex in facility.nearby) {
                if (facility.nearby[nearbyIndex]._id == req.params.nearbyid) {
                    Object.assign(facility.nearby[nearbyIndex], req.body);
                    return facility.save();        
                }
            }
            
            throw { code: 4041 };
        }).then(facility => {
            return res.status(200).send(facility);
        }).catch(err => {
            console.log(err);
            if (err.code === 404) return res.status(404).json({'error': 'Facility does not exist.'});
            if (err.code === 4041) return res.status(404).json({'error': 'Nearby entry does not exist.'});
    
            // Handle scenario when certain parameter type is incorrect.
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).send(err);
        });
}


var isInvalidNearByType = (type) => {
    return (MetaModel.locationType.indexOf(type) === -1);
}

/**
 * Delete nearby entry under a given facility.
 * Returns 404, if facility does not exist.
 * Returns Success, if nearby does not exist under the facility.
 */
exports.deleteNearBy = function(req, res) {
    FacilityModel.findOne({_id: req.params.facilityid})
        .then(facility => {
            if (!facility) throw {code: 404};
        
            facility.nearby = facility.nearby.filter(nearby => nearby._id != req.params.nearbyid);
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

/**
 * Returns unique cities where properties are available
 */
exports.getUniqueCities = function(req, res) {
    FacilityModel.find({}, 'address.city')
        .distinct('address.city')
        .then(records => {
            return res.status(200).json(records.sort());
        }).catch(err => {
            console.log(err);
            return res.status(500).send(err);
        });
}

/**
 * Returns unique localities for a given city where properties are located
 */
exports.getUniqueLocalities = function(req, res) {
    console.log(req.query.city);
    FacilityModel.find({'address.city':req.query.city}, 'address.locality')
        .distinct('address.locality')
        .then(records => {
        console.log(records);
            return res.status(200).json(records.sort());
        }).catch(err => {
            console.log(err);
            return res.status(500).send(err);
        });
}



