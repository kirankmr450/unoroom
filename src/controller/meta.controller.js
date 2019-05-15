exports.getRoomTypes = function(req, res) {
    return res.status(200).json(roomTypes);
}

exports.getBuildingAmenities = function(req, res) {
    return res.status(200).json(buildingAmenities);
}

exports.getRoomAmenities = function(req, res) {
    return res.status(200).json(roomAmenities);
}

var roomTypes = ["SingleRoomApt", "DoubleRoomApt", "Villa", "ServiceApt", "Hotel"];

var buildingAmenities = ["SwimmingPool", "Internet", "CarPark", "AirportTransfer", "Gym", "FrontDesk", "Spa", "Sauna", "Restaurant", "SmokingArea", "PetsAllowed", "Nightclub", "DisableFriendly", "BusinessFriendly"];

var roomAmenities = ["AirConditioning", "NonSmoking", "Smoking", "Bathtub", "Kitchen", "PrivatePool", "TV", "Balcony", "Terrace", "CoffeeMaker", "Refrigerator", "WashingMachine", "Heating", "PetsAllowed", "SemiFurnished", "FullyFurnished"];