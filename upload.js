var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var routes = require('./routes.js');
var FB = require('fb');

var app = express();

//assets and files
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/views'));



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var upload = multer({dest: './upload/'});




app.post('/upload', upload.single('calendar_user'), function(req, res, next){
    //console.log("here");

    //TODO: handle the user name
    var a = routes.convertCal('./upload/coursesCalendar.ics');

    var b = routes.processCourse(a);
    res.send(b);
});



app.listen(3000);
console.log('Listening on port 3000');
