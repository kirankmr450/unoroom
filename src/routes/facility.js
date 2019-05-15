let express = require('express');
let router = express.Router();
let facilityCtrl = require('../controller/facility.controller');

/**
 * Facility
 */
router.get('/', (req, res) => {
    return facilityCtrl.listFacility(req, res);
});

router.get('/:facilityid', (req, res) => {
    return facilityCtrl.listFacility(req, res);
});

router.post('/', (req, res) => {
    return facilityCtrl.createFacility(req, res);
});

router.put('/:facilityid', (req, res) => {
   return facilityCtrl.updateFacility(req, res); 
});

router.delete('/:facilityid', (req, res) => {
   return facilityCtrl.deleteFacility(req, res);
});

/**
 * Room
 */
router.post('/:facilityid', (req, res) => {
    return facilityCtrl.createRoom(req, res);
});

router.delete('/:facilityid/:roomid', (req, res) => {
    return facilityCtrl.deleteRoom(req, res);
});

router.put('/:facilityid/:roomid', (req, res) => {
    return facilityCtrl.updateRoom(req, res);
});

/**
 * META
 */
router.get('/roomtypes', (req, res) => {
   return facilityCtrl.getRoomTypes(req, res); 
});

router.get('/buildingamenities', (req, res) => {
   return facilityCtrl.getBuildingAmenities(req, res); 
});

router.get('/roomamenities', (req, res) => {
   return facilityCtrl.getRoomAmenities(req, res); 
});

module.exports = router;
