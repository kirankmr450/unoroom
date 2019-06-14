let express = require('express');
let rsvCtrl = require('../controller/reservation.controller');

let router = express.Router();

// Fetch reservations
router.get('/', (req, res) => {
    return rsvCtrl.list(req, res);
});
// Create new reservation
router.post('/', (req, res) => {
    return rsvCtrl.create(req, res);
});
// Fetch reservation by reservationid
router.get('/:reservationid', (req, res) => {
    return rsvCtrl.list(req, res);
});
// Update reservation by reservationid
router.put('/:reservationid', (req, res) => {
    return rsvCtrl.update(req, res);
});
// Confirm reservation by reservationid
router.put('/confirm/:reservationid', (req, res) => {
    return rsvCtrl.confirmReservation(req, res);
});
// Cancel reservation by reservationid
router.put('/cancel/:reservationid', (req, res) => {
    return rsvCtrl.cancelReservation(req, res);
});
// Delete reservation 
router.delete('/:reservationid', (req, res) => {
   return rsvCtrl.deleteReservation(req, res);
});

module.exports = router;
