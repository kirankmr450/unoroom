var mongoose = require('mongoose');
var UserModel = require('../model/user.model')
var MetaModel = require('../model/meta.model')
var Utils = require('../utils/utils');
var Error = require('../error/error');

// Check if the role has admin privileges
exports.hasAdminPrivileges = (user) => {
    return (user && ((user.role === MetaModel.userRoles.Root) ||
                     (user.role === MetaModel.userRoles.Admin))
           );
}

// Only user with admin privileges can perform this operation
exports.createUser = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
        if (!req.body.firstname) throw Error.UserError('Mandatory field "firstname" missing.');
        if (!req.body.emailid) throw Error.UserError('Mandatory field "emailid" missing.');
        if (!req.body.password) throw Error.UserError('Mandatory field "password" missing.');
        if (!req.body.role) throw Error.UserError('Mandatory field "role" missing.');
        if (isInvalidUserRole(req.body.role)) throw Error.UserError('Invalid user role.');
        
        var user = await new UserModel({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.emailid,
            isNewUser: true,
            active: true,
            password: req.body.password,
            role: req.body.role
        }).save();
        if (!user || user.length === 0) throw Error.ServerError('Error creating user.');
        return res.status(201).send({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            role: user.role
        });
    } catch (e) {
        // Email id is unique in the table. 
        // Handle duplicate email error message.
        if (e.code === 11000) return next(Error.ConflictError('Duplicate email id.'));
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        if (!e instanceof Error) return next(Error.ServerError('Server Error'));
        return next(e);
    }
}

// User can only change his own password.
// This check should be done by the caller.
exports.updatePassword = async (req, res, next) => {
    try {
        var user = await UserModel.findById(req.params.userid).exec();
        if (!user) throw Error.MissingItemError('User not found');
        user.password = req.body.password;
        user.isNewUser = false;
        user = await user.save();
        res.status(200).json({message: 'Password changed successfully'});
    } catch (e) {
        next(e);
    }
}

// Only admin can perform this operation.
exports.activateUser = async (req, res, next) => {
    try {
        var user = await UserModel.findByIdAndUpdate(req.params.userid, {active: true}).exec();
        if (!user) throw Error.MissingItemError('User not found');
        res.status(200).json({message: 'User activated successfully.'});
    } catch (e) {
        next(e);
    }
}

// Only admin can perform this operation.
exports.deactivateUser = async (req, res, next) => {
    try {
        var user = await UserModel.findByIdAndUpdate(req.params.userid, {active: false}).exec();
        if (!user) throw Error.MissingItemError('User not found');
        res.status(200).json({message: 'User deactivated successfully.'});
    } catch (e) {
        next(e);
    }
}


// Updates a user
exports.updateUser = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
        if (req.body.firstname !== undefined && !req.body.firstname) 
            throw Error.UserError('Mandatory field "firstname" missing.');
        var user = await UserModel.findById(req.params.userid).exec();
        if (!user) throw Error.MissingItemError('User not found');

        if (req.body.firstname !== undefined) user.firstname = req.body.firstname;
        if (req.body.lastname !== undefined) user.lastname = req.body.lastname;
        
        user = await user.save();
        return res.status(200).send({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username});
    } catch(e) {
        // Handle scenario when certain parameter type is incorrect.
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        return next(e);
    }
}


// Returns true: if passed role is NOT one of supported User Role.
// Otherwise false.
var isInvalidUserRole = (role) => {
    return (MetaModel.userRoles.indexOf(role) === -1);
}

// Only admin can invoke list all user
// Anyone else can invoke this API to fetch details about themselves by providing userid.
exports.listUser = async (req, res, next) => {
    try {
        if (req.params.userid) {
            var user = await UserModel.findOne({_id: req.params.userid}, 
                                          {passowrd: 0, isNewUser: 0, active: 0}).lean().exec();
            if (!user) throw Error.MissingItem('User does not exist.');
            return res.status(200).send(user);
        } else {
            var users = await UserModel.find({role: {$ne: MetaModel.userRoles.Root}}, 
                                             {password: 0}).lean().exec();
            if (!users) throw Error.ServerError('Something went wrong.');
            return res.status(200).send(users);
        }
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}