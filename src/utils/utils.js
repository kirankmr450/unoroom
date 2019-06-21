var rimraf = require('rimraf');

exports.removeDir = (dirpath) => {
    return new Promise((res, rej) => {
        rimraf(dirpath, (err) => {
            if (!err) res();
            else rej(err);
        }); 
    });
}