let express = require('express');
let router = express.Router();
let guestCtrl = require('../controller/guest.controller');

// QueryString => query property on the request object
// localhost:3000/guest?name=neeraj
router.get('/', (req, res) => {
    if (req.query.name) {
        res.send(`Request received for ${req.query.name}`);
    } else {
        return guestCtrl.list(req, res);
    }
});



router.post('/', (req, res) => {
    return guestCtrl.create(req, res);
});



// Forced error
//router.get('/error', (req, res) => {
//    throw new Error('This is a forced error');
//});

// Params property on the request object 
// localhost:3000/guest/neeraj
router.get('/:id', (req, res) => {
    return guestCtrl.list(req, res);
});


module.exports = router;
