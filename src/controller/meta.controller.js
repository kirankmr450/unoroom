<<<<<<< HEAD
exports.getCities = function(req, res) {
    return res.status(200).json(cities);
}

exports.getLocalitiesByCity = function(req, res) {
    return res.status(200).json(localities);
}

exports.getBuildingTypes = function(req, res) {
    return res.status(200).json(buildingtypes);
}

exports.getStates = function(req, res) {
    return res.status(200).json(states);
}

exports.getRoomTypes = function(req, res) {
    return res.status(200).json(roomTypes);
=======
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
>>>>>>> 40950851a56f122145c7ee943a42d0237cb0e830
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
var cities = [{
	"city": "Bangalore",
	"value": "bangalore"
}, {
	"city": "Chennai",
	"value": "chennai"
}, {
	"city": "Delhi",
	"value": "delhi"
}, {
	"city": "Mumbai",
	"value": "mumbai"
}, {
	"city": "Hyderbad",
	"value": "hyderbad"
}, {
	"city": "Kolkata",
	"value": "kolkata"
}]

<<<<<<< HEAD
var localities = [{
	"locality": "Near to Airport",
	"value": "nearbyairport"
}, {
	"locality": "Down Town Area",
	"value": "Down Town Area"
}]

var buildingtypes = [{
        "type": "Room",
        "value": "room"
    }, {
        "type": "Apartment 1BHK",
        "value": "1bhk"
    }, {
        "type": "Apartment 2BHK",
        "value": "2bhk"
    }, {
        "type": "Apartment 3BHK",
        "value": "3bhk"
    }]

    var states = [{
        "state": "TamilNadu",
        "value": "TN"
    }, {
        "state": "Karnataka",
        "value": "KA"
    }]

var roomTypes = ["SingleBedRoom", "DoubleBedRoom", "OneBHKApartment", "TwoBHKApartment", "ThreeBHKApartment"];

var buildingAmenities = ["SwimmingPools", "Internet", "CarPark", "AirportTransfer", "Gym", "FrontDesk", "Spa", "Sauna", "Restaurant", "SmokingArea", "PetsAllowed", "Nightclub", "DisableFriendly", "BusinessFriendly"];
=======
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
>>>>>>> 40950851a56f122145c7ee943a42d0237cb0e830

exports.getStates = (req, res) => {
    return res.status(200).json(MetaModel.indianStates.map((s) => s.name));
}

exports.getCountries = function(req, res) {
    return res.status(200).json(MetaModel.countries.map((c) => c.name));
}
