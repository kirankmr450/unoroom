console.log("hello world");

//var express = require('express');
//var bodyParser = require('body-parser');
//var path = require('path');
//
//var app = express();
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
//app.get('/', function(req, res) {
//   res.send('Hello World'); 
//});
//
//// Catch 404 error
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
//
//app.use(function(err, req, res, next) {
//    res.status(res.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});
//
//app.listen(3000, function() {
//    console.log('Example app listening on port 3000.');
//});
//
//module.exports = app;