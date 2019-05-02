let express = require('express');
let router = express.Router();

router.get('/guest', (req, res) => {
   res.send('You have requested a guest') ;
});

module.exports = router;