var rimraf = require('rimraf');
var passwordgenerator = require('password-generator');
var PASSWORD_MIN_LEN = 8;
var PASSWORD_MAX_LEN = 15;

exports.removeDir = (dirpath) => {
    return new Promise((res, rej) => {
        rimraf(dirpath, (err) => {
            if (!err) res();
            else rej(err);
        }); 
    });
}

// Generates a random password and return
exports.generatePassword = () => {
    var randomLength = Math.floor(Math.random() * (PASSWORD_MAX_LEN - PASSWORD_MIN_LEN)) + PASSWORD_MIN_LEN;
    return passwordgenerator(randomLength, false, /[\w\d\?\-]/);
}