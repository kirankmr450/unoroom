var mongoose = require('mongoose');
var PropertyIdModel = require('../model/propertyid.model')
var MetaModel = require('../model/meta.model')
const CITY_START_INDEX = 101;

exports.getLatestPropertyId = async (city) => {
    var cityPrefix = MetaModel.cityPrefixMap[city];
    if (!cityPrefix) throw Error.MissingItemError('Invalid city');

    var propertyRecord = await PropertyIdModel.findOne({city: cityPrefix});
        
    if (!propertyRecord) {
        propertyRecord = await createNewPropertyRecord(cityPrefix);
    } else {
        propertyRecord.lastindex += 1;
        await propertyRecord.save();
    }
    return propertyRecord.city + '-' + propertyRecord.lastindex;
}

// Create new property id record for city
var createNewPropertyRecord = async (city) => {
    var cityRecord = new PropertyIdModel({
        city: city,
        lastindex: CITY_START_INDEX
    });
    return await cityRecord.save();
}