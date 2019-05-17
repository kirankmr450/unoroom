let express = require('express');
let uiCtrl = require('../controller/ui.controller');

let router = express.Router();

router.get('/dashboard/places', (req, res) => {
    return uiCtrl.getKeyPlaces(req, res);
});

router.post('/dashboard/places', (req, res) => {
    return uiCtrl.addKeyPlace(req, res);
});

router.delete('/dashboard/places/:placeid', (req, res) => {
    return uiCtrl.deleteKeyPlaces(req, res);
});

router.get('/dashboard/featuredproperty', (req, res) => {
    return uiCtrl.getFeaturedProperty(req, res);
});

router.put('/dashboard/featuredproperty/:propertyid', (req, res) => {
    return uiCtrl.addFeaturedProperty(req, res);
});

router.delete('/dashboard/featuredproperty/:propertyid', (req, res) => {
    return uiCtrl.deleteFeaturedProperty(req, res);
});

module.exports = router;
