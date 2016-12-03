var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('js-md5');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
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

function login(req, res){
  var email = req.body.email;
  var password = req.body.password;
  var ret = {errors: []};

  var validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var validPwd = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{5,}$/;

  if(!validEmail.test(email)){
    ret.errors.push({
      field: "email",
      msg: "Invalid Email."
    });
  }
  if(!validPwd.test(password)){
    ret.errors.push({
      field: "password",
      msg: "Please enter a valid password. Passwords must include 1 uppercase, 1 lowercase, 1 special character and must have a minimum length of 5"
    });
  }

  if(ret.errors.length == 0){
    //search db
  }

  res.send(ret);

}

function signup(req, res){
  console.log("Recieved: ");
  console.log(req.body);

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var password = req.body.password;
  var confirmpwd = req.body.confirmpwd;
  var ret = {errors: []};

  var validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var validPwd = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{5,}$/;
  var validFname = /^[A-Z][a-z]+$/;
  var validLname = /^[A-Z][a-z]+$/;

  if(!validFname.test(firstname)){
    ret.errors.push({
      field: "firstname",
      msg: "Invalid Firstname"
    })
  }

  if(!validLname.test(lastname)){
    ret.errors.push({
      field: "lastname",
      msg: "Invalid Lastname"
    })
  }

  if(!validEmail.test(email)){
    ret.errors.push({
      field: "email",
      msg: "Invalid Email."
    });
  }

  if(password != confirmpwd){
    ret.errors.push({
      field: ["password", "confirmpwd"],
      msg: "Passwords do not match."
    })
  } else if(!validPwd.test(password)){
    ret.errors.push({
      field: "password",
      msg: "Please enter a valid password. Passwords must include 1 uppercase, 1 lowercase, 1 special character and must have a minimum length of 5"
    })
  }

  //connect to db and add
  if(ret.errors.length == 0){
    console.log("connect to db");
    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
      if(err){
        ret.errors.push({
          field: "general",
          msg: err
        })
      } else {
        console.log("connected to db!");

        //connect to db find users
        var userids = [];
        db.collection("users").find().each(function(err, item){

          if(item != null){
            userids.push(item.userid);
            if(item.email == email){
              //there is a duplicate email!
              console.log("duplicate");
              db.close();
              return;
            }
          } else {
            var newid =  Math.max(...userids) + 1;

            //insert it into database
            try {
              db.collection("users").insertOne({
                userid: newid,
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: md5(password),
                emailverified: false,
                fbconnected: false
              })
            } catch(e){
              console.log(e);
            }
          }
        })

      }

    });
  }


  res.send(ret);
}

//routes
app.post('/login', login);
app.post('/signup', signup);
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

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');
