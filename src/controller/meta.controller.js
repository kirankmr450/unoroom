var MetaModel = require('../model/meta.model');
var Error = require('../error/error');

exports.getRoomTypes = function(req, res, next) {
    var buildingType = req.query.buildingtype;
    if (MetaModel.isInvalidBuildingType(buildingType)) {
        next(Error.UserError('Invalid building type'));
        return;
    }
    return res.status(200).json(MetaModel.roomTypes[buildingType]);
}

exports.getBuildingTypes = function(req, res) {
    return res.status(200).json(MetaModel.buildingTypes);
}

exports.getBuildingAmenities = function(req, res) {
    return res.status(200).json(MetaModel.allAmenities());
}

exports.getRoomAmenities = function(req, res) {
//    return res.status(200).json(MetaModel.roomAmenities);
    return res.status(404).json('This API is no longer supported. Use building amenities API.');
}

exports.getUserRoles = (req, res) => {
    return res.status(200).json(MetaModel.userRoles);
}

exports.getLocationTypes = function(req, res) {
    return res.status(200).json(MetaModel.locationType);
}

exports.getCities = function(req, res) {
    return res.status(200).json(Object.keys(MetaModel.cities).sort());
}

exports.getLocalities = function(req, res) {
    var localities = [];
    if (MetaModel.cities.hasOwnProperty(req.query.city)) {
        localities = MetaModel.cities[req.query.city];
    }
    return res.status(200).json(localities.sort());
}

exports.getStates = (req, res) => {
    return res.status(200).json(MetaModel.indianStates.map((s) => s.name));
}

exports.getCountries = function(req, res) {
    return res.status(200).json(MetaModel.countries.map((c) => c.name));
}
