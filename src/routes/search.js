let express = require('express');
let router = express.Router();
let searchCtrl = require('../controller/search.controller');

// Get all available facilites for a given duration
router.get('/facilities', (req, res) => {
    return searchCtrl.searchAllFacilities(req, res);
});

// Get availability in a facility for a given duration 
router.get('/facility/:facilityid', (req, res) => {
   return searchCtrl.searchFacility(req, res); 
});

// Search all hotels - Without any reservations
router.get('/hotels', (req, res, next) => {
    return searchCtrl.searchAllHotels(req, res, next);
});

// Search all service apartments - Without any reservations
router.get('/apartments', (req, res, next) => {
    return searchCtrl.searchAllApartments(req, res, next);
});

module.exports = router;