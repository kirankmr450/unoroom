let express = require('express');
let router = express.Router();
let propertyCtrl = require('../controller/property.controller');
let authCtrl = require('../controller/auth.controller');
let ImgCtrl = require('../utils/image.utils');
let Error = require('../error/error');

/**
 * Property API
 */
// All edit APIs require authenticate user
router.post('*', authCtrl.authenticateMW);
router.put('*', authCtrl.authenticateMW);
router.delete('*', authCtrl.authenticateMW);

// Create new facility
router.post('/', (req, res, next) => {
    return propertyCtrl.createFacility(req, res, next);
});
// Add image to a facility
// Message body is as follows:
//  file: <image-file>
//  category: image-category-name
//  description: image-description
router.post('/image/:facilityid', ImgCtrl.Upload.single('file'), (req, res, next) => {
    if (!req.file) return next(Error.ServerError('Error creating file'));
    return propertyCtrl.uploadFacilityImage(req, res, next);
});
// Delete an image associated with a facility
// Must specify the image id in the URL path.
router.delete('/image/:facilityid/:imageid', (req, res, next) => {
    return propertyCtrl.deleteFacilityImage(req, res, next);
});
// Get facility image file
router.get('/image/:filename', (req, res, next) => {
    return propertyCtrl.getFacilityImage(req, res, next); 
});

// Get All Facilites
router.get('/', (req, res, next) => {
    return propertyCtrl.listFacility(req, res, next);
});
// Get all unique cities where property exist
router.get('/cities', (req, res, next) => {
   return propertyCtrl.getUniqueCities(req, res, next); 
});
// Get all unique localities where property exist for a given city
router.get('/localities', (req, res, next) => {
   return propertyCtrl.getUniqueLocalities(req, res, next); 
});
// Get a facility by facility id
router.get('/:facilityid', (req, res, next) => {
    return propertyCtrl.listFacility(req, res, next);
});

// Update facility by facility id
router.put('/:facilityid', (req, res, next) => {
   return propertyCtrl.updateFacility(req, res, next); 
});
// Delete a facility 
router.delete('/:facilityid', (req, res, next) => {
   return propertyCtrl.deleteFacility(req, res, next);
});
// Delist a facility
// Delisting a facility make it hidden by search API.
// Facility list API will still list those facilities.
// All associated reservation made in the facility is still valid.
router.put('/delist/:facilityid', (req, res, next) => {
    return propertyCtrl.delistFacility(req, res, next);
});
// Publish a facility
// By default a newly created publish is not visible to search API.
// User must publish the property and make it public.
// Publishing a property does some validation (TODO: Needs to be improved).
// For example, You cannot publish a property, if it does not have any associated rooms.
router.put('/publish/:facilityid', (req, res, next) => {
    return propertyCtrl.publishFacility(req, res, next);
});


/**
 * Room API
 */
// Create new room
router.post('/room/:facilityid', (req, res, next) => {
    return propertyCtrl.createRoom(req, res, next);
});
// Add image to a room
// Message body is as follows:
//  file: <image-file>
//  category: image-category-name
//  description: image-description
router.post('/room/image/:facilityid/:roomid', ImgCtrl.Upload.single('file'), (req, res, next) => {
    if (!req.file) return next(Error.ServerError('Error creating file'));
    return propertyCtrl.uploadRoomImage(req, res, next);
});
// Delete an image associated with a room
// Must specify the image id in the URL path.
router.delete('/room/image/:facilityid/:roomid/:imageid', (req, res, next) => {
    return propertyCtrl.deleteRoomImage(req, res, next);
});
// Get Room image file
router.get('/room/image/:filename', (req, res, next) => {
    return propertyCtrl.getRoomImage(req, res, next); 
});

// Update room by facility id and room id
router.put('/room/:facilityid/:roomid', (req, res, next) => {
    return propertyCtrl.updateRoom(req, res, next);
});
// Delete room by facility id and room id
router.delete('/room/:facilityid/:roomid', (req, res, next) => {
    return propertyCtrl.deleteRoom(req, res, next);
});

/**
 * Nearby API
 */
// Add Nearby
router.post('/nearby/:facilityid', (req, res, next) => {
    return propertyCtrl.addNearBy(req, res, next); 
});
// Update nearby by facility id and nearby id
router.put('/nearby/:facilityid/:nearbyid', (req, res, next) => {
   return propertyCtrl.updateNearBy(req, res, next); 
});
// Delete nearby by facility id and nearby id
router.delete('/nearby/:facilityid/:nearbyid', (req, res, next) => {
   return propertyCtrl.deleteNearBy(req, res, next);
});


module.exports = router;
