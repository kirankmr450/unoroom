let express = require('express');
let mailCtrl = require('../utils/mail.utils');

let router = express.Router();

router.get('/sendmail', (req, res) => {
    return mailCtrl.sendWelcomeMailToGuest(req.query.name, req.query.mailid, res);
});

module.exports = router;