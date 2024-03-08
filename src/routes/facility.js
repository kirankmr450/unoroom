let express = require('express');
let router = express.Router();
let facilityCtrl = require('../controller/facility.controller');

/**
 * Facility
 */
router.get('/', (req, res) => {
    return facilityCtrl.listFacility(req, res);
});

router.post('/', (req, res) => {
    return facilityCtrl.createFacility(req, res);
});

router.get('/:facilityid', (req, res) => {
    return facilityCtrl.listFacility(req, res);
});

router.put('/:facilityid', (req, res) => {
   return facilityCtrl.updateFacility(req, res); 
});

router.delete('/:facilityid', (req, res) => {
   return facilityCtrl.deleteFacility(req, res);
});

/**
 * Building Image Upload
 */
router.post('/image/:facilityid', (req, res) => {
    return facilityCtrl.createPropertyImages(req, res);
});

/**
 * Landmark
 */
router.post('/nearby/:facilityid', (req, res) => {
    return facilityCtrl.createLandmark(req, res);
});

router.delete('/nearby/:facilityid/:landmarkid', (req, res) => {
    return facilityCtrl.deleteLandmark(req, res);
});

router.put('/nearby/:facilityid/:landmarkid', (req, res) => {
    return facilityCtrl.updateLandmark(req, res);
});

/**
 * Room
 */
router.post('/room/:facilityid', (req, res) => {
    return facilityCtrl.createRoom(req, res);
});

router.delete('/room/:facilityid/:roomid', (req, res) => {
    return facilityCtrl.deleteRoom(req, res);
});

router.put('/room/:facilityid/:roomid', (req, res) => {
    return facilityCtrl.updateRoom(req, res);
});

module.exports = router;
