var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');

var routes = require('./routes.js');


var app = express();

app.set('view engine', 'pug');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/'));


var upload = multer({dest: './upload/'});

app.get('/', function(req, res) {
    //res.sendfile('./views/calander.html');
    res.sendfile('./views/test.html');
});

app.post('/comparePage', function(req, res) {
    //res.sendfile('./views/calander.html');
    res.sendfile('./views/comparison.html');
});


app.post('/upload', upload.single('calendar_user'), function(req, res, next){
  var a = routes.convertCal('./upload/coursesCalendar.ics');
    var c =  routes.convertCal('./upload/courses_Calendar.ics');

    var array = [];


    var b = routes.processCourse(a,'1');
    var d = routes.processCourse(c,'2');
    array.push(b);
    array.push(d);
    fs.writeFile('jsonfile.JSON', JSON.stringify(array), function (err) {
    if (err) 
        return console.log(err);
    
    });

    //TODO: SEND DATA TO DISPLAYCALENDAR
   res.send(array);
	//res.render('displayCalendar', {array: array}); 
});

app.post('/tempstore', routes.tempstore);
app.get('/tempget', routes.tempget);

app.get('/compare', routes.compare);


app.get('/search', routes.searchClassmates);

app.get('/recommended', routes.recommendedFriends);


app.listen(3000);
console.log('Listening on port 3000');