var express = require('express');
//var bodyParser = require('body-parser');
//var path = require('path');
let guestRoute = require('./routes/guest');

var app = express();
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
   res.send('Hello World'); 
});
app.use(guestRoute);

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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server listening on port ${PORT}.`));
