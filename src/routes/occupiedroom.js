let express = require('express');
let router = express.Router();
let occupiedRoomCtrl = require('../controller/occupiedroom.controller');

router.get('/', (req, res) => {
    return occupiedRoomCtrl.list(req, res);
});

router.post('/', (req, res) => {
    return occupiedRoomCtrl.create(req, res);
});

router.delete('/:id', (req, res) => {
   return occupiedRoomCtrl.delete(req, res);
});

module.exports = router;
