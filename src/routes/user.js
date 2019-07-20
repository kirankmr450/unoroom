let express = require('express');
let userCtrl = require('../controller/user.controller');
let Error = require('../error/error');

let router = express.Router();

// User list can be fetched only by admin.
router.get('/', (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.listUser(req, res, next);
});

// User can be created only by admin
router.post('/', (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.createUser(req, res, next);
});

// User id details can be fetched by someone on his own userid
// or by Admin
router.get('/:userid', (req, res, next) => {
    if (!req.user) return next(Error.ForbiddenError('Insufficient permission.'));
    if (req.user.role !== 'Admin' && req.user.id != req.params.userid)
        return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.listUser(req, res, next);
});

router.put('/:userid', (req, res, next) => {
    if (!req.user) return next(Error.ForbiddenError('Insufficient permission.'));
    if (req.user.role !== 'Admin' && req.user.id != req.params.userid)
        return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.updateUser(req, res, next);
});

router.post('/activate/:userid', (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.activateUser(req, res, next);
});

router.post('/deactivate/:userid', (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.deactivateUser(req, res, next);
});

module.exports = router;
