var mongoose = require('mongoose');
var UiModel = require('../model/ui.model');
var FacilityModel = require('../model/facility.model');
var _ = require('lodash/array');

exports.getKeyPlaces = async (req, res, next) => {
    try {
        var response = await UiModel.findOne().lean().exec();
        if (!response ||
            !response.keyplaces ||
            !response.keyplaces.length === 0) {
             return res.status(200).json([]);
         }
        return res.status(200).json(response.keyplaces);
    } catch (e) {
        next(e);
    }
}

exports.addKeyPlace = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
        if (!req.body.cityname) throw Error.UserError("Mandatory field 'cityname' missing.");
        
        var uiContentDocument = await UiModel.findOne();
        if (!uiContentDocument) {
            uiContentDocument = new UiModel({
                keyplaces: [],
                featuredproperty: []
            });
        }
        uiContentDocument.keyplaces.push(req.body);
        uiContentDocument = await uiContentDocument.save();
        return res.status(200).json({message: 'Place added'});
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}

exports.updateKeyPlaces = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) throw Error.UserError('Request body is missing');
        
        // If 'cityname' is provided, it must not be empty string.
        if (req.body.cityname !== undefined  &&
            !req.body.cityname) throw Error.UserError("Mandatory field 'cityname' cannot be empty.");
        
        var uiContentDocument = await UiModel.findOne();
        if (!uiContentDocument ||
           !uiContentDocument.keyplaces ||
           uiContentDocument.keyplaces.length === 0) {
            throw Error.MissingItemError('Place does not exist.');
        }
        
        if (placeIndex in uiContentDocument.keyplaces) {
            if (uiContentDocument.keyplaces[placeIndex]._id == req.params.placeid) {
                Object.assign(uiContentDocument.keyplaces[placeIndex], req.body);
                uiContentDocument = await uiContentDocument.save();
                return res.status(200).json({message: 'Place removed.'});
            }
        }
        throw Error.MissingItemError('Place does not exist.');
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}

exports.deleteKeyPlaces = async(req, res, next) => {
    try {
        var uiContentDocument = await UiModel.findOne();
        if (!uiContentDocument ||
            !uiContentDocument.keyplaces ||
            uiContentDocument.keyplaces.length === 0) {
            return res.status(200).json({'message': 'Place removed.'});
        }
        uiContentDocument.keyplaces = uiContentDocument.keyplaces.filter(place => place._id != req.params.placeid);
        uiContentDocument = await uiContentDocument.save();
        return res.status(200).json({message: 'Place removed.'});
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}

exports.getFeaturedProperty = async(req, res, next) => {
    try {
        var response = await UiModel.findOne({}, 'featuredproperty').exec();
        // If no featured property, return empty array.
        if (!response ||
            !response.featuredproperty ||
            response.featuredproperty.length == 0) {
            return res.status(200).json([]);
        }

        var facilities = await FacilityModel
            .find({_id: {$in: response.featuredproperty}}, 'facilityid name buildingtype roomtypes status address images amenities nearby')
            .sort({createdOn: 'desc'})
            .lean()
            .exec();
        return res.status(200).send(facilities);
    } catch (e) {
        next(e);
    }
}

exports.addFeaturedProperty = async(req, res, next) => {
    try {
        var facility = await FacilityModel.findById(req.params.propertyid);
        if (!facility) throw Error.MissingItemError('Facility does not exist.');
        
        var uiContentDocument = await UiModel.findOne();
        if (!uiContentDocument) {
            uiContentDocument = new UiModel({
                keyplaces: [],
                featuredproperty: [mongoose.Types.ObjectId(req.params.propertyid)]
            });
        } else {
            uiContentDocument.featuredproperty = _.union(uiContentDocument.featuredproperty, [mongoose.Types.ObjectId(req.params.propertyid)]);
        }
        uiContentDocument = await uiContentDocument.save();
        return res.status(200).json({message: 'Property marked as featured.'});
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}

exports.deleteFeaturedProperty = async (req, res, next) => {
    try {
        var uiContentDocument = await UiModel.findOne();
        if (!uiContentDocument || 
            !uiContentDocument.featuredproperty ||
            uiContentDocument.featuredproperty.length == 0) {
            return res.status(200).json({message: 'Property un-marked as featured.'});
        }

        uiContentDocument.featuredproperty = uiContentDocument.featuredproperty.filter(id => id != req.params.propertyid);

        uiContentDocument = await uiContentDocument.save();
        return res.status(200).json({message: 'Property un-marked as featured.'});
    } catch (e) {
        if (e.name == 'CastError') return next(Error.UserError('Invalid argument'));
        next(e);
    }
}

