var Multer = require('multer');
var sharp = require('sharp');
var mkdirp = require('mkdirp');

const BASE_IMG_FOLDER = './public/images/';
const FACILITY_FOLDER_NAME = 'facility/'

const API_BASE_URL = '/image/'

var storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, getFolderPath(req));
    },
    
    filename: (req, file, cb) => {
        var filetype = '';
        if(file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if(file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if(file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, getFilename() + '.' + filetype);
    }
});

var getFolderPath = (req) => {
    if (req.originalUrl.indexOf('room/') == -1) {
        return getFacilityFolder(req.params.facilityid);
    } else {
        return getRoomFolder(req.params.facilityid, req.params.roomid);
    }
}

// Create folder for the facility
// Returns folder name
var getFacilityFolder = (facilityid) => {
    var foldername = BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + facilityid;
    mkdirp.sync(foldername);
    return foldername;
}

var getRoomFolder = (facilityid, roomid) => {
    var foldername = BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + facilityid + '/' + roomid;
    mkdirp.sync(foldername);
    return foldername;
}

// Create image file name based on current timestamp
var getFilename = () => {
    var hrTime = process.hrtime();
    var filename = hrTime[0] * 1000000000 + hrTime[1];
    return filename;
}

// Fetch image file url for the entity
// Where, entity could be facility.
exports.getFacilityImageFileUrl = (facilityId, imgFileName) => {
    return API_BASE_URL + facilityId + '_' + imgFileName;
}

exports.getFacilityImageFilePath = (imgurl) => {
    var files = imgurl.slice(imgurl.lastIndexOf('/') + 1).split('_');
    return BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + files[0] + '/' + files[1];
}

// Fetch image file url for the entity
// Where, entity could be room.
exports.getRoomImageFileUrl = (facilityId, roomId, imgFileName) => {
    return API_BASE_URL + facilityId + '_' + roomId + '_' + imgFileName;
}

exports.getRoomFilePath = (facilityId, roomId) => {
    return BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + facilityId + '/' + roomId;
}

exports.getRoomImageFilePath = (imgurl) => {
    var files = imgurl.slice(imgurl.lastIndexOf('/') + 1).split('_');
    return BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + files[0] + '/' + files[1] + '/' + files[2];
}

// Create image thumbnail from image file
exports.createThumbnail = (srcFilepath) => {
    return new Promise((res, rej) => {
        sharp(srcFilepath)
            .resize({width: 200, height: 200, fit: 'inside', position: 'center'})
            .toBuffer()
            .then(res).catch(rej);
    });
}

exports.Upload = Multer({storage: storage});