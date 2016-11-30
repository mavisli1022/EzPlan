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
    //var c =  routes.convertCal('./upload/courses_Calendar.ics');

    //var array = [];

    current_userid = '1';
    var b = routes.processCourse(a,'1');
    //var d = routes.processCourse(c,'2');
    //array.push(b);
    //array.push(d);
    console.log("in post");

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        if (err){
            console.log(error)
        }
        db.collection("timetable").findOne({userid: current_userid}), function(err,doc){
            var ret = {errors: []};
            if(doc == null){
                //not upload calendar so far
                console.log("here----")
                try {
                    console.log("in try----")
                    db.collection("timetable").insertOne({
                        userid: current_userid,
                        courseSummary: b
                    }, function(err, doc){
                        db.close();
                    })
                } catch(e){
                    console.log(e);
                }

            } else {
                ret.errors.push({
                    field: "general",
                    msg: "Already existed calendar for current user"
                })
                
            }
        }
    });
    //fs.writeFile('jsonfile.JSON', JSON.stringify(array), function (err) {
    //if (err) 
    //    return console.log(err);
    
    //});
    //console.log(b)
	res.render('displayCalendar', {array: b}); 
});


app.get('/findUser', routes.findOne);

app.post('/tempstore', routes.tempstore);
app.get('/tempget', routes.tempget);

app.get('/compare', routes.compare);



app.listen(3000);
console.log('Listening on port 3000');
