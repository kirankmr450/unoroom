let express = require('express');
let uiCtrl = require('../controller/ui.controller');

let router = express.Router();

router.get('/dashboard/places', (req, res, next) => {
    return uiCtrl.getKeyPlaces(req, res, next);
});

router.post('/dashboard/places', (req, res, next) => {
    return uiCtrl.addKeyPlace(req, res, next);
});

router.put('/dashboard/places/:placeid', (req, res, next) => {
   return uiCtrl.updateKeyPlaces(req, res, next); 
});

router.delete('/dashboard/places/:placeid', (req, res, next) => {
    return uiCtrl.deleteKeyPlaces(req, res, next);
});

router.get('/dashboard/featuredproperty', (req, res, next) => {
    return uiCtrl.getFeaturedProperty(req, res, next);
});

router.put('/dashboard/featuredproperty/:propertyid', (req, res, next) => {
    return uiCtrl.addFeaturedProperty(req, res, next);
});

router.delete('/dashboard/featuredproperty/:propertyid', (req, res, next) => {
    return uiCtrl.deleteFeaturedProperty(req, res, next);
});

module.exports = router;
