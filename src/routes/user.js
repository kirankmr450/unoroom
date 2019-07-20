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

// User details by userid can be fetched by admin
// Non-admin user can fetch details about himself.
router.get('/:userid', (req, res, next) => {
    if (!req.user) return next(Error.ForbiddenError('Insufficient permission.'));
    if (req.user.role !== 'Admin' && req.user.id != req.params.userid)
        return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.listUser(req, res, next);
});

// All users can be updated by admin
// Non-admin user can update himself.
router.put('/:userid', (req, res, next) => {
    if (!req.user) return next(Error.ForbiddenError('Insufficient permission.'));
    if (req.user.role !== 'Admin' && req.user.id != req.params.userid)
        return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.updateUser(req, res, next);
});

// A user can be activated by admin only
router.post('/activate/:userid', (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.activateUser(req, res, next);
});

// A user can be deactivated by admin only
router.post('/deactivate/:userid', (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') return next(Error.ForbiddenError('Insufficient permission.'));
    return userCtrl.deactivateUser(req, res, next);
});

module.exports = router;
