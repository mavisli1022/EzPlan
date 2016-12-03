var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
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
    //var a = routes.convertCal('./upload/coursesCalendar.ics');
    var c =  routes.convertCal('./upload/courses_Calendar.ics');

    //var array = [];

    current_userid = '2';
    var b = routes.processCourse(c,'2');
  

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        if (err){
            console.log(error)
        }
        db.collection("timetable").find({userid: current_userid}, function(err,doc){
            console.log('++++++')
            console.log(doc)
            console.log('+++++++')
            
            if(doc == null){
                try {
                    db.collection("timetable").insertOne({
                        userid: current_userid,
                        courseSummary: b['courseSummary']
                    }, function(err, doc){
                        db.close();
                    })
                } catch(e){
                    console.log(e);
                }
            }
            else{
                db.collection("timetable").findOneAndUpdate({userid: current_userid}, {courseSummary: b['courseSummary']}, function(err, timetable){
                    if (err) throw err;
                    console.log("Update!")
                })
            }
        })
        db.close();
    });
    res.render('displayCalendar', {array: b}); 
});

app.get('/findUser', routes.findOne);

app.post('/tempstore', routes.tempstore);
app.get('/tempget', routes.tempget);

app.get('/compare', routes.compare);



app.listen(3000);
console.log('Listening on port 3000');
