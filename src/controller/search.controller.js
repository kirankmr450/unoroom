var RsvController = require('./reservation.controller');
var FacilityController = require('./facility.controller');

// Get all available facilites for a given duration
// QSP Supported:
//   city=<comma-separated-cities> (bangalore,ahmedabad)
//   amenities=<building-amenities> (Can specify multiple amenities field)
//   roomtype=<room-type> (All amenities which has at-least one room of this type)
//   checkindate=YYYY-MM-DD (Check-in date)
//   checkoutdate=YYYY-MM-DD (Check-out date)
exports.searchAllFacilities = function(req, res) {
    // Step-1: First fetch all facilities matching the filter
    FacilityController.fetchAllFacilities({
        city: req.query.city,
        amenities: req.query.amenities,
        roomtype: req.query.roomtype
    })
        // Step-2: Check availability in each facility for the said dates
        // and filter unavailable facilities.
        .then(facilities => filterFacilitiesWithAvailabilities(req, facilities))
        .then(filteredFacilities => res.status(200).send(filteredFacilities))
        .catch(err => res.status(500).send(err));
}

// Fetch availability in each facility in the said dates.
// Then remove unavailable facility from the facility list.
// Return filtered list.
// Design pattern link:
// https://stackoverflow.com/a/39135740
var filterFacilitiesWithAvailabilities = (req, facilities) => {
    var query = {
        roomtype: req.query.roomtype,
        checkindate: req.query.checkindate,
        checkoutdate: req.query.checkoutdate
    };
    
    // Reduce facilities by its availability
    // For each facility, find the bookedroomcount for said dates 
    // using API RsvController.fetchReservedRoomCount()
    // And then compare it with availability count of that roomtype
    // in facility model. If there are still room available, add that
    // facility in the final filteredFacilities.
    return facilities.reduce((promise, currentFacility) => {
        return promise.then(filteredFacilitiesSoFar => {
            query['facilityid'] = currentFacility._id;
            return RsvController
                .fetchReservedRoomCountByRoomType(query)
                .then(bookedRoomCount => {
                    var rooms = currentFacility.rooms.filter(room => room.type === req.query.roomtype);
                    var totalRoomCount = rooms[0].count;
                    console.log('Availability in: ' + currentFacility._id + 
                                ' Total: ' + totalRoomCount + '\nBooked: ' + bookedRoomCount);
                    // If there are no rooms, do not add the facility in the final list.
                    if (totalRoomCount > bookedRoomCount) { 
                        currentFacility['availableRoomCount'] = {
                            _id: req.query.roomtype,
                            count: totalRoomCount - bookedRoomCount
                        };
                        filteredFacilitiesSoFar.push(currentFacility);
                    }
                    return filteredFacilitiesSoFar;
                });
        });
    }, Promise.resolve([]));
}


// Get availability in a facility for a given duration 
// Returns availability of each roomtype in a given facility.
// Facility id is passed in the path.
// Supported QSP:
//   checkindate=YYYY-MM-DD (Check-in date)
//   checkoutdate=YYYY-MM-DD (Check-out date)
exports.searchFacility = function(req, res) {
    // Step-1: Fetch facility details by facility id
    FacilityController.fetchFacilityById(req.params.facilityid)
        .then(facility => {
            if (null == facility) res.status(404).send({error: 'Facility not found.'});
            // Check availability in the facility
            return fetchAvailabilityInFacility(
                facility, req.query.checkindate, req.query.checkoutdate);
        }).then(facility => {
            res.status(200).json(facility);
        }).catch(err => res.status(500).send(err));
}

// Fetch availability in the facility
// Add 'availableRoomCount' attribute to the facility object.
var fetchAvailabilityInFacility = (facility, checkindate, checkoutdate) => {
    return RsvController
        .fetchAllReservedRoomCount({facilityid: facility._id, 
                                    checkindate, 
                                    checkoutdate})
        .then(bookedRoomCount => {
            console.log(JSON.stringify(bookedRoomCount));
            for (roomIndex in bookedRoomCount) {
                var rooms = facility.rooms.filter(room => room.type===bookedRoomCount[roomIndex]._id);
                
                bookedRoomCount[roomIndex].count = (bookedRoomCount[roomIndex].count > rooms[0].count) ? 0 : (rooms[0].count - bookedRoomCount[roomIndex].count);
            }
            facility['availableRoomCount'] = bookedRoomCount;
            return facility;
        });
}

