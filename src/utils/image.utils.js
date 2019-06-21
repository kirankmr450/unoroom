var Multer = require('multer');
var mkdirp = require('mkdirp');

const BASE_IMG_FOLDER = './public/images/';
const FACILITY_FOLDER_NAME = 'facility/'

const API_BASE_URL = './image/'

var storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, getFacilityFolder(req.params.facilityid));
    },
    
    filename: (req, file, cb) => {
        console.log(file);
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

// Create folder for the facility
// Returns folder name
var getFacilityFolder = (facilityid) => {
    var foldername = BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + facilityid;
    mkdirp.sync(foldername);
    return foldername;
}

var getFilename = () => {
    var hrTime = process.hrtime();
    var filename = hrTime[0] * 1000000000 + hrTime[1];
    console.log(filename);
    return filename;
}

exports.getFacilityImageFileUrl = (facilityId, imgFileName) => {
    return API_BASE_URL + facilityId + '_' + imgFileName;
}

exports.getFacilityImageFilePath = (imgurl) => {
    var files = imgurl.slice(imgurl.lastIndexOf('/') + 1).split('_');
    return BASE_IMG_FOLDER + FACILITY_FOLDER_NAME + files[0] + '/' + files[1];
}

exports.Upload = Multer({storage: storage});