let express = require('express');
let mailCtrl = require('../controller/mail.controller');

let router = express.Router();

router.get('/sendmail', (req, res) => {
    return mailCtrl.sendWelcomeMailToGuest(req.query.name, req.query.mailid, res);
});

module.exports = router;