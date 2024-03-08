var fs = require('fs');
var resolve = require('path').resolve;
var PropertyModel = require('../model/property.model');
var MetaModel = require('../model/meta.model');
var PropCtrl = require('./propertyid.controller');
var _ = require('lodash/array');
var Utils = require('../utils/utils');
var ImgUtils = require('../utils/image.utils');
var Error = require('../error/error');

const FACILITY_STATUS_ACTIVE = 'active';
const FACILITY_STATUS_INACTIVE = 'inactive';

exports.createFacility = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) 
            throw Error.UserError('Request body is missing');
        if (!req.body.name) 
            throw Error.UserError("Mandatory field 'name' missing.");
        
        // Ensure all entries in amenities belong to
        // meta.model.buildingAmenities
        if (isInvalidBuildingAmenities(req.body.amenities)) 
            throw Error.UserError('Invalid amenities in the amenity list');
        
        // Ensure building type belong to meta.model.buildingTypes
        if (MetaModel.isInvalidBuildingType(req.body.buildingtype))
            throw Error.UserError('Invalid building type');
        
        // Check address and city
        if (!req.body.address || !req.body.address.city)
            throw Error.UserError('Mandatory field "city" missing');
        
        // Fetch propertyid to be assigned to this property
        var propertyid = await PropCtrl.getLatestPropertyId(req.body.address.city);
        // Create property in database
        var facilityDoc = await new PropertyModel({
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
        }).save();
        if (!facilityDoc || facilityDoc.length === 0) throw Error.ServerError('Error creating guest.');
        
        return res.status(201).send(facilityDoc);
    } catch(e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    } // catch(e)
} // createFacility()

var isInvalidBuildingAmenities = (amenities) => {
    var diff = _.difference(amenities, MetaModel.allAmenities());
    if (diff.length > 0) return true;
    return false;
}

exports.updateFacility = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0)
            throw Error.UserError('Request body is missing');
        
        // If 'name' is provided, it must not be empty string.
        if (req.body.name !== undefined && !req.body.name)
            throw Error.UserError("Mandatory field 'name' cannot be empty.");
        
        // Ensure all entries in amenities belong to
        // meta.model.buildingAmenities
        if (isInvalidBuildingAmenities(req.body.amenities))
            throw Error.UserError('Invalid amenities in the amenity list');
        
        // If buildingtype is provided, ensure building type belong to meta.model.buildingTypes
        if (req.body.buildingtype !== undefined && MetaModel.isInvalidBuildingType(req.body.buildingtype))
            throw Error.UserError('Invalid building type');
        
        var facilityDoc = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facilityDoc) throw Error.MissingItemError('Facility does not exist.');
        
        delete req.body['facilityid'];
        delete req.body['status'];
        delete req.body['images'];
        Object.assign(facilityDoc, req.body);
        var doc = await facilityDoc.save();
        return res.status(200).send(doc);
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
} // updateFacility()

// Add image to a facility
exports.uploadFacilityImage = async (req, res, next) => {
    try {
        var facilityDoc = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facilityDoc) throw Error.MissingItemError('Facility does not exist.');
        
        var thumbnail = await ImgUtils.createThumbnail(req.file.path);
        
        var img = {
            category: req.body.category,
            description: req.body.description,
            mimetype: req.file.mimetype,
            url: ImgUtils.getFacilityImageFileUrl(req.params.facilityid, req.file.filename),
            thumbnail
        };

        facilityDoc.images.push(img);
        facilityDoc = await facilityDoc.save();
        return res.status(200).send(facilityDoc);
    } catch(e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
} // uploadFacilityImage()

// Get facility image
exports.getFacilityImage = async (req, res, next) => {
    var filepath = ImgUtils.getFacilityImageFilePath(req.originalUrl);
    // Handle inexistent file path
    if (!filepath || !fs.existsSync(filepath))
        return next(Error.MissingItemError('File does not exist'));
    
    return res.sendFile(resolve(filepath));
}

// Delete images associated with a facility.
exports.deleteFacilityImage = async (req, res, next) => {
    try {
        var facilityDoc = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facilityDoc) throw Error.MissingItemError('Facility does not exist.');
            
        // Remember the image file name to be removed.
        var img = facilityDoc.images.find(image => image._id == req.params.imageid);
        if (!img) throw Error.MissingItemError('Image does not exist in said facility.');
        
        var filepath = ImgUtils.getFacilityImageFilePath(img.url);
        
        // Update the facility document
        facilityDoc.images = facilityDoc.images.filter(image => image._id != req.params.imageid);
        facilityDoc = await facilityDoc.save();
        
        // Remove the image file
        await Utils.removeDir(filepath);
        return res.status(200).send(facilityDoc);
    } catch(e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
} // deleteFacilityImage()

exports.listFacility = async (req, res, next) => {
    try {
        if (req.params.facilityid) {
            var facility = await PropertyModel.findOne({_id: req.params.facilityid}).lean();
            if (!facility) throw Error.MissingItemError('Facility does not exist.');
            return res.status(200).send(facility);
        } else {
            var facilities = await PropertyModel.find(getFacilityFilter(req.query))
                .sort({ createdOn: 'desc'}).lean();
            res.status(200).send(facilities);
        }
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
}

exports.fetchAllFacilities = (query) => {
    return PropertyModel.find(getFacilityFilter(query))
        .lean().exec();
}

exports.fetchFacilityById = (facilityid) => {
    return PropertyModel.findOne({_id: facilityid}).lean();
}

var getFacilityFilter = (query) => {
    // Individual QSP fields are 'AND'ed
    var qsp = {};
    
    // QSP: buildingtype=Hotel/ServiceApartment
    if (query.buildingtype && typeof query.buildingtype === 'string') {
        Object.assign(qsp, {'buildingtype': query.buildingtype});
    }
    
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

exports.deleteFacility = (req, res, next) => {
    return next(Error.MissingItemError('This API is no longer supported. Please invoke delist facility API to delist a property.'));
//    PropertyModel.findOneAndRemove({_id: req.params.facilityid})
//        .then(facility => {
//            if (!facility) return res.status(404).json({"error": "Facility does not exist."});
//
//                return res.status(200).send(facility);
//            }).catch(err => {
//               return res.status(500).send({"error": "Server error"}); 
//            });
}

// Delist a facility
exports.delistFacility = async (req, res, next) => {
    try {
        var facility = await PropertyModel.findByIdAndUpdate(
                req.params.facilityid, 
                {status: FACILITY_STATUS_INACTIVE},
                {new: true});

        if (!facility) throw Error.MissingItemError('Facility not found.');
        res.status(200).json(facility);
    } catch(e) {
        next(e);
    }
} // delistFacility()

// Publish a facility
exports.publishFacility = async (req, res, next) => {
    try {
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist');
        if (!facility.rooms || facility.rooms.length === 0)
            throw Error.ForbiddenError('Facility does not have rooms. It cannot be published.');
        
        var roomCount = facility.rooms.reduce((count, room) => count + room.count, 0);
        if (roomCount === 0) throw Error.ForbiddenError('Facility does not have rooms. It cannot be published.');
        
        facility.status = FACILITY_STATUS_ACTIVE;
        facility = await facility.save();
        res.status(200).send(facility);
    } catch(e) {
        next(e);
    }
} // publishFacility()


exports.checkIfRoomExist = function(facilityId, bookedRooms) {
    return new Promise((resolve, reject) => {
        PropertyModel.findOne({_id: facilityId})
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


exports.createRoom = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
        
        // Ensure all entries in amenities belong to
        // meta.model.roomAmenities
        if (isInvalidRoomAmenities(req.body.amenities)) 
            throw Error.UserError('Invalid amenities in the amenity list');
        
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');
        
        // Ensure room type belong to meta.model.roomTypes
        if (MetaModel.isInvalidRoomType(facility.buildingtype, req.body.type)) 
            throw Error.UserError('Invalid room type');
        
        facility.rooms.push(req.body);
        facility = await facility.save();
        return res.status(201).send(facility);
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
}

exports.updateRoom = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0)
            throw Error.UserError('Request body is missing');
    
        // Ensure all entries in amenities belong to
        // meta.model.roomAmenities
        if (isInvalidRoomAmenities(req.body.amenities))
            throw Error.UserError('Invalid amenities in the amenity list');
            
        // If room type is provided, ensure room type belong to meta.model.roomTypes
        if (req.body.type !== undefined && MetaModel.isInvalidRoomType(req.body.type))
            throw Error.UserError('Invalid room type');
        
        // First, look up the facility
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');

        for (roomIndex in facility.rooms) {
            if (facility.rooms[roomIndex]._id == req.params.roomid) {
                Object.assign(facility.rooms[roomIndex], req.body);
                facility = await facility.save();
                return res.status(200).send(facility);
            }
        }
        throw Error.MissingItemError('Room does not exist.');
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
} // updateRoom()


var isInvalidRoomAmenities = (amenities) => {
    var diff = _.difference(amenities, MetaModel.roomAmenities);
    if (diff.length > 0) return true;
    return false;
}

/**
 * Delete room under a given facility.
 */
exports.deleteRoom = async (req, res, next) => {
    try {
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');
        
        facility.rooms = facility.rooms.filter(room => room._id != req.params.roomid);
        facility = await facility.save();
        
        // Remove the image file
        await Utils.removeDir(ImgUtils.getRoomFilePath(req.params.facilityid, req.params.roomid));
        return res.status(200).send(facility);
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}


// Add image to a room
exports.uploadRoomImage = async (req, res, next) => {
    try {
        // First, look up the facility
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');

        var thumbnail = await ImgUtils.createThumbnail(req.file.path);
        var img = {
            category: req.body.category,
            description: req.body.description,
            mimetype: req.file.mimetype,
            url: ImgUtils.getRoomImageFileUrl(req.params.facilityid, req.params.roomid, req.file.filename),
            thumbnail
        };
        for (roomIndex in facility.rooms) {
            if (facility.rooms[roomIndex]._id == req.params.roomid) {
                facility.rooms[roomIndex].images.push(img);
                facility = await facility.save();
                return res.status(200).send(facility);
            }
        }
        throw Error.MissingItemError('Room does not exist.');
    } catch(e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
} // uploadRoomImage()

// Get room image
exports.getRoomImage = async (req, res, next) => {
    var filepath = ImgUtils.getRoomImageFilePath(req.originalUrl);
    // Handle inexistent file path
    if (!filepath || !fs.existsSync(filepath))
        return next(Error.MissingItemError('File does not exist'));
    
    return res.sendFile(resolve(filepath));
}

// Delete images associated with a room.
exports.deleteRoomImage = async (req, res, next) => {
    try {
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');
        
        for (roomIndex in facility.rooms) {
            if (facility.rooms[roomIndex]._id == req.params.roomid) {
                // Remember the image file name to be removed.
                var img = facility.rooms[roomIndex].images.find(image => image._id == req.params.imageid);
                if (!img) throw Error.MissingItemError('Image does not exist in said facility.');
                
                var filepath = ImgUtils.getRoomImageFilePath(img.url);
                
                // Update the facility document
                facility.rooms[roomIndex].images = facility.rooms[roomIndex].images.filter(image => image._id != req.params.imageid);
                facility = await facility.save();
                
                // Remove the image file
                await Utils.removeDir(filepath);
                return res.status(200).send(facility);
            }
        }
        throw Error.MissingItemError('Room does not exist.');
    } catch(e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
} // deleteRoomImage()


/**
 * Add nearyby entry under a given facility.
 */
exports.addNearBy = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
    
        // Ensure nearby type belong to
        // meta.model.locationType
        if (isInvalidNearByType(req.body.locationtype))
            throw Error.UserError('Invalid location type.');
        
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');
        
        facility.nearby.push(req.body);
        facility = await facility.save();
        return res.status(201).send(facility);
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}

/**
 * Update nearby entry under a given facility
 */
exports.updateNearBy = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
        
        // if locationType is provided, ensure nearby type belong to
        // meta.model.locationType
        if (req.body.locationtype !== undefined && isInvalidNearByType(req.body.locationtype))
            throw Error.UserError('Invalid location type.');
    
        // First, look up the facility
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');

        for (nearbyIndex in facility.nearby) {
            if (facility.nearby[nearbyIndex]._id == req.params.nearbyid) {
                Object.assign(facility.nearby[nearbyIndex], req.body);
                facility = await facility.save();
                return res.status(200).send(facility);
            }
        }

        throw Error.MissingItemError('Nearby entry does not exist.');
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}


var isInvalidNearByType = (type) => {
    return (MetaModel.locationType.indexOf(type) === -1);
}

/**
 * Delete nearby entry under a given facility.
 * Returns 404, if facility does not exist.
 * Returns Success, if nearby does not exist under the facility.
 */
exports.deleteNearBy = async (req, res, next) => {
    try {
        var facility = await PropertyModel.findOne({_id: req.params.facilityid});
        if (!facility) throw Error.MissingItemError('Facility does not exist.');
        
        facility.nearby = facility.nearby.filter(nearby => nearby._id != req.params.nearbyid);
        facility = await facility.save();
        return res.status(200).send(facility);
    } catch (e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
}

/**
 * Returns unique cities where properties are available
 */
exports.getUniqueCities = async (req, res, next) => {
    try {
        var records = await PropertyModel.find({}, 'address.city').distinct('address.city');
        return res.status(200).json(records.sort());
    } catch (e) {
        next(e);
    }
}

/**
 * Returns unique localities for a given city where properties are located
 */
exports.getUniqueLocalities = async (req, res, next) => {
    try {
        var records = await PropertyModel.find({'address.city':req.query.city}, 'address.locality')
                        .distinct('address.locality');
        return res.status(200).json(records.sort());
    } catch (e) {
        next(e);
    }
}



