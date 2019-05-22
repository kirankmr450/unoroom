var MetaModel = require('../model/meta.model');

exports.getRoomTypes = function(req, res) {
    return res.status(200).json(MetaModel.roomTypes);
}

exports.getBuildingAmenities = function(req, res) {
    return res.status(200).json(MetaModel.buildingAmenities);
}

exports.getRoomAmenities = function(req, res) {
    return res.status(200).json(MetaModel.roomAmenities);
}

exports.getLocationTypes = function(req, res) {
    return res.status(200).json(MetaModel.locationType);
}
