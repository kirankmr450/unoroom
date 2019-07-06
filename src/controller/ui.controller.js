var mongoose = require('mongoose');
var UiModel = require('../model/ui.model');
var FacilityModel = require('../model/facility.model');
var _ = require('lodash/array');

exports.getKeyPlaces = function(req, res) {
    UiModel.findOne()
        .lean()
        .exec()
        .then(response => {
             if (!response ||
                 !response.keyplaces ||
                 !response.keyplaces.length === 0) {
                 return res.status(200).json([]);
             }
             return res.status(200).json(response.keyplaces);
        }).catch(err => {
            return res.status(500).send({'error': 'Server error'}); 
        });
}

exports.addKeyPlace = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    if (!req.body.cityname) {
        return res.status(400)
            .json({"error": "Mandatory field 'cityname' missing."})
    }
    UiModel.findOne()
        .then(uiContentDocument => {
            if (!uiContentDocument) {
                uiContentDocument = new UiModel({
                    keyplaces: [],
                    featuredproperty: []
                });
            }
            uiContentDocument.keyplaces.push(req.body);
            return uiContentDocument.save();
        }).then(uiContentDocument => {
            return res.status(200).send("Place added.");
        }).catch(err => {
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}

exports.updateKeyPlaces = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400)
            .json({"error": "Request body is missing"});
    }
    // If 'cityname' is provided, it must not be empty string.
    if (req.body.cityname !== undefined  &&
        !req.body.cityname) {
        return res.status(400)
            .json({"error": "Mandatory field 'cityname' cannot be empty."})
    }
    UiModel.findOne()
        .then(uiContentDocument => {
            if (!uiContentDocument ||
               !uiContentDocument.keyplaces ||
               uiContentDocument.keyplaces.length === 0) {
                throw { code: 404 };   
            }
            if (placeIndex in uiContentDocument.keyplaces) {
                console.log(uiContentDocument.keyplaces[placeIndex]._id);
                if (uiContentDocument.keyplaces[placeIndex]._id == req.params.placeid) {
                    Object.assign(uiContentDocument.keyplaces[placeIndex], req.body);
                    return uiContentDocument.save();
                }
            }
            throw { code: 404 };
        }).then(uiContentDocument => {
            return res.status(200).send('Place removed.');
        }).catch(err => {
            if (err.code === 404) return res.status(404).send('Place does not exist.');
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}

exports.deleteKeyPlaces = function(req, res) {
    UiModel.findOne()
        .then(uiContentDocument => {
            if (!uiContentDocument ||
               !uiContentDocument.keyplaces ||
               uiContentDocument.keyplaces.length === 0) {
                throw { code: 200 };   
            }
            
            uiContentDocument.keyplaces = uiContentDocument.keyplaces.filter(place => place._id != req.params.placeid);

            return uiContentDocument.save();
        }).then(uiContentDocument => {
            return res.status(200).send('Place removed.');
        }).catch(err => {
            if (err.code === 200) return res.status(200).send('Place removed.');
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}

exports.getFeaturedProperty = function(req, res) {
    UiModel.findOne({}, 'featuredproperty')
        .exec()
        .then(response => {
            // If no featured property, return empty array.
            if (!response ||
                !response.featuredproperty ||
                response.featuredproperty.length == 0) {
                throw { code: 200 };
            }
        
            return FacilityModel
                .find({_id: {$in: response.featuredproperty}}, 'name roomtypes address images amenities nearby')
                .sort({createdOn: 'desc'})
                .lean()
                .exec();
        }).then(facilities => {
            return res.status(200).send(facilities);
        }).catch(err => {
            if (err.code === 200) return res.status(200).json([]);
            return res.status(500).send({"error": "Server error"});
        });
}

exports.addFeaturedProperty = function(req, res) {
    FacilityModel.findById(req.params.propertyid)
        .then(facility => {
            if (!facility) throw {code: 404};
            return UiModel.findOne(); 
        }).then(uiContentDocument => {
            if (!uiContentDocument) {
                uiContentDocument = new UiModel({
                    keyplaces: [],
                    featuredproperty: [mongoose.Types.ObjectId(req.params.propertyid)]
                });
            } else {
                uiContentDocument.featuredproperty = _.union(uiContentDocument.featuredproperty, [mongoose.Types.ObjectId(req.params.propertyid)]);
            }
            return uiContentDocument.save();
        }).then(uiContentDocument => {
            return res.status(200).send({message: "Property marked as featured."});
        }).catch(err => {
            if (err.code === 404) return res.status(404).send({'error': 'Property does not exist.'});
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}

exports.deleteFeaturedProperty = function(req, res) {
    UiModel.findOne()
        .then(uiContentDocument => {
            if (!uiContentDocument || 
                !uiContentDocument.featuredproperty ||
                uiContentDocument.featuredproperty.length == 0) throw { code: 200 };
        
            uiContentDocument.featuredproperty = uiContentDocument.featuredproperty.filter(id => id != req.params.propertyid);

            return uiContentDocument.save();
        }).then(uiContentDocument => {
            return res.status(200).send('Property unmarked as featured.');
        }).catch(err => {
            if (err.code === 200) return res.status(200).send({message: 'Property unmarked as featured.'});
            if (err.name == 'CastError') return res.status(400).send({'error': 'Invalid argument'});
            return res.status(500).json(err);
        });
}

