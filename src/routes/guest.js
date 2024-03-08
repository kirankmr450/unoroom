let express = require('express');
let guestCtrl = require('../controller/guest.controller');
let authCtrl = require('../controller/auth.controller');

let router = express.Router();

// All guest API requires authentication
router.all('*', authCtrl.authenticateMW);

router.get('/', (req, res) => {
    return guestCtrl.list(req, res);
});

router.post('/', (req, res) => {
    return guestCtrl.create(req, res);
});

router.get('/:guestid', (req, res) => {
    return guestCtrl.list(req, res);
});

router.put('/:guestid', (req, res) => {
    return guestCtrl.update(req, res);
});

router.delete('/:guestid', (req, res) => {
   return guestCtrl.delete(req, res);
});

module.exports = router;
