let express = require('express');
let router = express.Router();
let facilityCtrl = require('../controller/facility.controller');

/**
 * Facility
 */
// Create new facility
router.post('/', (req, res) => {
    return facilityCtrl.createFacility(req, res);
});
router.post('/upload/:facilityid', (req, res) => {
    
});

// Get All Facilites
router.get('/', (req, res) => {
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
// Get a facility by facility id
router.get('/:facilityid', (req, res) => {
    return facilityCtrl.listFacility(req, res);
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
