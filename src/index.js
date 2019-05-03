var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
let guestRoute = require('./routes/guest');
let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/unorooms', {useNewUrlParser: true});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/guest', guestRoute);

// Catch 404 error
app.use((req, res, next) => {
    res.status(404).send('Resource not found');
});

//Handle for error 500
app.use((err, req, res, next) => {
    console.log("PRINTING THIS ERRPR", err);
    res.status(500).send('Error accessing the resource');
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server listening on port ${PORT}.`));
