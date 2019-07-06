let express = require('express');
let router = express.Router();
let facilityCtrl = require('../controller/facility.controller');
let ImgCtrl = require('../utils/image.utils');

/**
 * Facility
 */
// Create new facility
router.post('/', (req, res) => {
    return facilityCtrl.createFacility(req, res);
});
// Add image to a facility
// Message body is as follows:
//  file: <image-file>
//  category: image-category-name
//  description: image-description
router.post('/image/:facilityid', ImgCtrl.Upload.single('file'), (req, res) => {
    if (!req.file) return res.status(500).send({error: 'Error creating file'});
    return facilityCtrl.uploadFacilityImage(req, res);
});
// Delete an image associated with a facility
// Must specify the image id in the URL path.
router.delete('/image/:facilityid/:imageid', (req, res) => {
    return facilityCtrl.deleteFacilityImage(req, res);
});
// Get facility image file
router.get('/image/:filename', (req, res) => {
    return facilityCtrl.getFacilityImage(req, res); 
});

// Get All Facilites
router.get('/', (req, res) => {
    return facilityCtrl.listFacility(req, res);
});
// Get a facility by facility id
router.get('/:facilityid', (req, res) => {
    return facilityCtrl.listFacility(req, res);
});
// Get all unique cities where property exist
router.get('/cities', (req, res) => {
   return facilityCtrl.getUniqueCities(req, res); 
});
// Get all unique localities where property exist for a given city
router.get('/localities', (req, res) => {
   return facilityCtrl.getUniqueLocalities(req, res); 
});


// Update facility by facility id
router.put('/:facilityid', (req, res) => {
   return facilityCtrl.updateFacility(req, res); 
});
// Delete a facility 
router.delete('/:facilityid', (req, res) => {
   return facilityCtrl.deleteFacility(req, res);
});
// Delist a facility
// Delisting a facility make it hidden by search API.
// Facility list API will still list those facilities.
// All associated reservation made in the facility is still valid.
router.put('/delist/:facilityid', (req, res) => {
    return facilityCtrl.delistFacility(req, res);
});
// Publish a facility
// By default a newly created publish is not visible to search API.
// User must publish the property and make it public.
// Publishing a property does some validation (TODO: Needs to be improved).
// For example, You cannot publish a property, if it does not have any associated rooms.
router.put('/publish/:facilityid', (req, res) => {
    return facilityCtrl.publishFacility(req, res);
});


/**
 * Room API
 */
// Create new room
router.post('/room/:facilityid', (req, res) => {
    return facilityCtrl.createRoom(req, res);
});
// Add image to a room
// Message body is as follows:
//  file: <image-file>
//  category: image-category-name
//  description: image-description
router.post('/room/image/:facilityid/:roomid', ImgCtrl.Upload.single('file'), (req, res) => {
    if (!req.file) return res.status(500).send({error: 'Error creating file'});
    return facilityCtrl.uploadRoomImage(req, res);
});
// Delete an image associated with a room
// Must specify the image id in the URL path.
router.delete('/room/image/:facilityid/:imageid', (req, res) => {
    return facilityCtrl.deleteFacilityImage(req, res);
});
// Get Room image file
router.get('/room/image/:filename', (req, res) => {
    return facilityCtrl.getFacilityImage(req, res); 
});


// Update room by facility id and room id
router.put('/room/:facilityid/:roomid', (req, res) => {
    return facilityCtrl.updateRoom(req, res);
});
// Delete room by facility id and room id
router.delete('/room/:facilityid/:roomid', (req, res) => {
    return facilityCtrl.deleteRoom(req, res);
});

/**
 * Nearby API
 */
// Add Nearby
router.post('/nearby/:facilityid', (req, res) => {
    return facilityCtrl.addNearBy(req, res); 
});
// Update nearby by facility id and nearby id
router.put('/nearby/:facilityid/:nearbyid', (req, res) => {
   return facilityCtrl.updateNearBy(req, res); 
});
// Delete nearby by facility id and nearby id
router.delete('/nearby/:facilityid/:nearbyid', (req, res) => {
   return facilityCtrl.deleteNearBy(req, res);
});


module.exports = router;
