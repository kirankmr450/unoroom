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
}

exports.getBuildingAmenities = function(req, res) {
    return res.status(200).json(buildingAmenities);
}

exports.getRoomAmenities = function(req, res) {
    return res.status(200).json(roomAmenities);
}

exports.getLocationTypes = function(req, res) {
    return res.status(200).json(locationType);
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

var roomAmenities = ["AirConditioning", "NonSmoking", "Smoking", "Bathtub", "Kitchen", "PrivatePool", "TV", "Balcony", "Terrace", "CoffeeMaker", "Refrigerator", "WashingMachine", "Heating", "PetsAllowed", "SemiFurnished", "FullyFurnished"];

var locationType = ["BusStand", "RailwayStation", "MetroStation", "Airport", "Beach", "ShoppingMall", "Downtown", "Pubs", "Park", "Temple", "Museum", "University", "Stadium", "Hospital"];