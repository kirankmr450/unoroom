var mongoose = require('mongoose');
var PropertyIdModel = require('../model/propertyid.model')
var MetaModel = require('../model/meta.model')
const CITY_START_INDEX = 101;

exports.getLatestPropertyId = function (city) {
    var cityPrefix = MetaModel.cityPrefixMap[city];
    if (!cityPrefix) return Promise.reject(404);

    return PropertyIdModel.findOne({city: cityPrefix})
        .then(record => {
            if (!record) return createNewPropertyRecord(cityPrefix);
            record.lastindex += 1;
            return record.save();
        }).then(record => {
            return record.city + '-' + record.lastindex;
        });
}

// Create new property id record for city
var createNewPropertyRecord = (city) => {
    var cityRecord = new PropertyIdModel({
        city: city,
        lastindex: CITY_START_INDEX
    });
    return cityRecord.save()
}