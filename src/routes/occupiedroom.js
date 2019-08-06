let express = require('express');
let router = express.Router();
let occupiedRoomCtrl = require('../controller/occupiedroom.controller');
let authCtrl = require('../controller/auth.controller');

router.get('/', (req, res) => {
    return occupiedRoomCtrl.list(req, res);
});

// All modification to occupation requires authentication
router.all('*', authCtrl.authenticateMW);

router.post('/', (req, res) => {
    return occupiedRoomCtrl.create(req, res);
});

router.delete('/:id', (req, res) => {
   return occupiedRoomCtrl.delete(req, res);
});

module.exports = router;
