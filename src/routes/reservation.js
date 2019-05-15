let express = require('express');
let rsvCtrl = require('../controller/reservation.controller');

let router = express.Router();

router.get('/', (req, res) => {
    return rsvCtrl.list(req, res);
});

router.post('/', (req, res) => {
    return rsvCtrl.create(req, res);
});

router.get('/:reservationid', (req, res) => {
    return rsvCtrl.list(req, res);
});

router.put('/:reservationid', (req, res) => {
    return rsvCtrl.update(req, res);
});

router.delete('/:reservationid', (req, res) => {
   return rsvCtrl.delete(req, res);
});

module.exports = router;
