var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
let mongoose = require('mongoose');

let Error = require('./error/error');
let authCtrl = require('./controller/auth.controller');

let authRoute = require('./routes/auth');
let userRoute = require('./routes/user');
let guestRoute = require('./routes/guest');
let propertyRoute = require('./routes/property');
let occupiedRoomRoute = require('./routes/occupiedroom');
let metaRoute = require('./routes/meta');
let uiRoute = require('./routes/ui');
let utilsRoute = require('./routes/utils');
let reservationRoute = require('./routes/reservation');
let searchRoute = require('./routes/search');

mongoose.connect('mongodb://localhost:27017/unorooms', {useNewUrlParser: true});

var app = express();
// TODO: Configure this properly when domain name is registered.
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(authCtrl.initialize());
app.use('/auth', authRoute);
/*** AUTHENTICATION is now handled at routes ***/
// Authentication API (/auth) does not require user authentication
// Hence they are placed above authentication check.
//app.all('*', (req, res, next) => {
//    return authCtrl.authenticate((err, user, info) => {
//            if (err) return next(err);
//            if (!user) {
//                if (info.name === "TokenExpiredError") {
//                    return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
//                } else {
//                    return res.status(401).json({ message: info.message });
//                }
//            }
//            app.set("user", user);
//            req.user = user;
//            return next();
//        })(req, res, next);
//});
app.use('/guest', guestRoute);
app.use('/user', userRoute);
app.use('/facility', propertyRoute);
app.use('/occupiedroom', occupiedRoomRoute);
app.use('/meta', metaRoute);
app.use('/ui', uiRoute);
app.use('/utils', utilsRoute);
app.use('/reservation', reservationRoute);
app.use('/search', searchRoute);

// Catch 404 error
app.use((req, res, next) => {
    res.status(404).send('Resource not found');
});

//Catch all error
app.use((err, req, res, next) => {
    console.log("Error at Index.JS: ", err);
    if (!(err instanceof Error)) return res.status(500).json({message: 'Server Error'});
    res.status(err.code).json(err.response);
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server listening on port ${PORT}.`));
