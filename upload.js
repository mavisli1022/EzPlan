var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var routes = require('./routes.js');
//var FB = require('fb');

var app = express();

//assets and files
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/views'));



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var upload = multer({dest: './upload/'});

app.get('/', function(req, res) {
    res.sendfile('./views/calander.html');
});



app.post('/upload', upload.single('calendar_user'), function(req, res, next){
    var a = routes.convertCal('./upload/coursesCalendar.ics');
    var c =  routes.convertCal('./upload/courses_Calendar.ics');

    var array = [];


    var b = routes.processCourse(a,'1');
    var d = routes.processCourse(c,'2');
    array.push(b);
    array.push(d);
    fs.writeFile('jsonfile.json', array, function (err) {
    if (err) 
        return console.log(err);
    
    });

	res.send(array); 
});



app.listen(3000);
console.log('Listening on port 3000');
