let express = require('express');
let metaCtrl = require('../controller/meta.controller');

let router = express.Router();

router.get('/roomtypes', (req, res) => {
   return metaCtrl.getRoomTypes(req, res); 
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

router.get('/cities', (req, res) => {
   return metaCtrl.getCities(req, res); 
});

router.get('/localities', (req, res) => {
    return metaCtrl.getLocalities(req, res);
});

router.get('/countries', (req, res) => {
    return metaCtrl.getCountries(req, res); 
});
module.exports = router;
