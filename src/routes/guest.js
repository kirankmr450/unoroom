let express = require('express');
let router = express.Router();

// QueryString => query property on the request object
// localhost:3000/guest?name=neeraj
router.get('/', (req, res) => {
    if (req.query.name) {
        res.send(`Request received for ${req.query.name}`);
    } else {
        res.send('You have requested a guest');
    }
});

// Forced error
//router.get('/error', (req, res) => {
//    throw new Error('This is a forced error');
//});

// Params property on the request object 
// localhost:3000/guest/neeraj
router.get('/:name', (req, res) => {
    res.send(`Request receive for ${req.params.name}`);
});


module.exports = router;