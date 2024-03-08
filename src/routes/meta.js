let express = require('express');
let metaCtrl = require('../controller/meta.controller');

let router = express.Router();

router.get('/cities', (req, res) => {
   return metaCtrl.getCities(req, res); 
});
router.get('/localities', (req, res) => {
   return metaCtrl.getLocalitiesByCity(req, res); 
});

router.get('/roomtypes', (req, res) => {
   return metaCtrl.getRoomTypes(req, res); 
});

router.get('/buildingtypes', (req, res) => {
   return metaCtrl.getBuildingTypes(req, res); 
});

router.get('/states', (req, res) => {
   return metaCtrl.getStates(req, res); 
});

router.get('/buildingamenities', (req, res) => {
   return metaCtrl.getBuildingAmenities(req, res); 
});

router.get('/roomamenities', (req, res) => {
   return metaCtrl.getRoomAmenities(req, res); 
});

router.get('/locationtype', (req, res) => {
    return metaCtrl.getLocationTypes(req, res);
});
module.exports = router;
