var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('js-md5');
var MongoClient = require('mongodb').MongoClient;
var session = require('client-sessions');
var nodemailer = require('nodemailer');
var fs = require('fs');
var multer = require('multer');
var routes = require('./routes.js');
//create nodemailer transport system
var transporter = nodemailer.createTransport('smtps://shrey.kumar.ca%40gmail.com:8809asAS@smtp.gmail.com');

var app = express();

var userID = "";

//assets and files
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/views'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: false
}));

//define session variable
app.use(session({
  cookieName: 'session',
  secret: 'ezplansecret',
  duration: 9000000,
  activeDuration: 9000000
}))


function login(req, res){
  var email = req.body.email;
  var password = req.body.password;

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ console.log(err)}
    db.collection("users").findOne({
      email: email,
      password: md5(password)
    }, function(err, doc){
      var ret = {errors: []};
      if(doc == null){
        ret.errors.push({
          field: "general",
          msg: "Username and Password not found."
        })
      } else {
        //login here
        userID = doc.userid;
      }
      res.send(ret);
    })

  });
}

function signup(req, res){
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

  //console.log(firstname);
  //console.log(lastname);

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ console.log(error) }
    db.collection("users").count({email: email}, function(error, num){
      if(error){ console.log(error) }
      var ret = {"errors": []};
      //console.log(validFname.test(firstname));
      /* FORM VALIDATION */
      if(firstname.charAt(0) != firstname.charAt(0).toUpperCase()){
        ret.errors.push({
          field: "firstname",
          msg: "Invalid Firstname"
        })
      }

      if(lastname.charAt(0) != lastname.charAt(0).toUpperCase()){
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


      if(ret.errors.length == 0){
        if(num > 0){
          ret.errors.push({
            field: "email",
            msg: "Email taken."
          })
        } else {
          //find the new id
          db.collection("users").find().sort({"userid":-1}).limit(1).forEach(function(doc){
            var newid = doc.userid + 1;
            //insert it into database
            try {
              db.collection("users").insertOne({
                userid: newid,
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: md5(password),
                level: "user",
                emailverified: false,
                fbconnected: false
              }, function(err, doc){
                //finish everything
                userID = newid;
                db.close();
              })
            } catch(e){
              console.log(e);
            }
          })
        }

      }

      res.send(ret);

    });
  });
}

function signupFB(req, res){
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var friends = req.body.friends;
  var fbID = req.body.fbid;

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){console.log(err)}
    db.collection("users").count({email: email}, function(error, num){
      var ret = {"errors": []};
      if(num > 0){
        //email already registered
        //just log them in
        db.collection("users").findOne({
          email: email
        }, function(err, doc){
          userID = doc.userid;
        })


      } else {
        db.collection("users").find().sort({"userid":-1}).limit(1).forEach(function(doc){
          try {
            var newID = doc.userid + 1;
            console.log(fbID);
            db.collection("users").insertOne({
              userid: newID,
              firstname: firstname,
              lastname: lastname,
              email: email,
              password: null,
              level: "user",
              emailverified: false,
              fbconnected: true,
              fbID: fbID
            }, function(err, doc){
              //populate friends list
              console.log("init total friends");
              var totalFriends = [];
              for(var i = 0; i < friends.length; i++){
                db.collection("users").findOne({
                  fbID: friends[i].id
                }, function(err, doc){
                  //if nothing is found, dont do anything
                  if(doc != null){
                    //you are now friends with this person today
                    var today = new Date();
                    var year = today.getFullYear();
                    var day = today.getDate();
                    var month = today.getMonth()+1;

                    var fullDate = day + "/" + month + "/" + year;

                    var friend = {
                      userid: doc.userid,
                      datefriended: fullDate
                    }
                    totalFriends.push(friend);
                  }
                })
              }

              //wait for friends to finish populating
              setTimeout(function(){
                //now insert this shit into friends
                var newUser = {
                  userid: newID,
                  friends: totalFriends
                }

                db.collection("friends").insertOne(newUser, function(err, doc){
                  //finally set session
                  if(err){console.log(err)}

                  userID = newID;
                  db.close();
                })
              }, 500);


            })
          } catch(e){
            console.log(e);
          }
        });
      }
      res.send(ret);
    });
  });
}

function getProfile(req, res){
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var userid = userID;
    db.collection("users").findOne({userid: userid}, function(error, doc){
      if(error){ console.log(error) }
      res.send(doc);
      db.close();
    });
  });
}

function verifyEmail(req, res){
  var email = req.body.email;
  var userid = req.body.userid;
  var name = req.body.fname;

  var code = md5(email);
  //send email to "email"
  var mailOptions = {
    from: '"EzPlan" <shrey.kumar.ca@gmail.com>',
    to: email,
    subject: name + ', confirm your email',
    text: "What's up " + name + ", Welcome to Ezplan! We just need you to do 1 more thing...Click this link to confirm your email: http://localhost:3000/verify/" + code,
    html: "<h1>What's up " + name + ",</h1><br><p>Welcome to <b>Ezplan</b>!</p> <p>We just need you to do 1 more thing...Click this <a href='http://localhost:3000/verify/" + code +"'>link</a> to confirm your email.</p>"
  }

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return res.send(error);
    }
    res.send(info.response);
  });

}

function confirmEmail(req, res){
  var code = req.params.code;

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("users").findOne({
      userid: parseInt(userID)
    }, function(err, doc){
      if(md5(doc.email) == code){
        //set emailverified to true
        db.collection("users").update(
          {userid: parseInt(userID)},
          {$set: {emailverified: true}},
          function(err, doc){
            if(!err){
              res.redirect("/");
            }
          }
        )
      }
    })
  });

}

function getFriends(req, res){
  var sessionUser = userID;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("friends").findOne({
      userid: sessionUser
    }, function(err, doc){
      res.send(doc);
    })
  });

}

function getUserByID(req, res){
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var currentID = req.params.id;
    var query = {
      userid: parseInt(currentID)
    }
    db.collection("users").findOne(query, function(err, doc){
      res.send(doc);
      db.close();
    })
  });
}

function removeFriendByID(req, res){
  var sessionID = userID;
  var currentID = parseInt(req.params.id);
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    //res.send("Sent:" + sessionID);
    db.collection("friends").update(
      {
        userid: sessionID
      },
      {
        $pull: {
          "friends": {
            userid: currentID
          }
        }
      }, function(err, doc){
        res.redirect('/friends');
        db.close();
      });
  });
}

function getFriendsByFname(req, res){
  var name = req.params.name;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var ret = [];
    db.collection("users").find({
      firstname: name
    }).forEach(function(doc){
      if(doc.userid != userID){
        ret.push(doc);
      }
    })

    setTimeout(function(){
      res.send(ret);
    }, 500);

  });
}

function getFriendsByEmail(req, res){
  var email = req.params.email;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var ret = [];
    db.collection("users").find({
      email: email
    }).forEach(function(doc){
      if(doc.userid != userID){
        ret.push(doc);
      }
    })

    setTimeout(function(){
      res.send(ret);
    }, 500);

  });
}

function getFriendsByFullName(req, res){
  var firstname = req.params.first;
  var lastname = req.params.last;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var ret = [];
    db.collection("users").find({
      firstname: firstname,
      lastname: lastname
    }).forEach(function(doc){
      if(doc.userid != userID){
        ret.push(doc);
      }
    });

    setTimeout(function(){
      res.send(ret);
      db.close();
    }, 500);

  });

}

function addFriendByID(req, res){
  //check if user already a friend, if not add it in
  var friendID = req.params.id;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth()+1;
    var year = today.getFullYear();

    var fullDate = day + "/" + month + "/" + year;

    db.collection("friends").update({
      userid: parseInt(userID)
    }, {
      $addToSet: {
        friends: {
          userid: parseInt(friendID),
          datefriended: fullDate
        }
      }
    }, function(err, doc){
      if(!err){
        res.redirect("/friends");
      } else {
        console.log(err);
      }
    })

  });


}

//routes
app.post('/login', login);
app.post('/signup', signup);
app.post('/signupfb', signupFB);
app.post('/verify', verifyEmail);
app.get('/verify/:code', confirmEmail);
app.get('/session', getProfile);
app.get('/getfriends', getFriends);
app.get('/getuser/:id', getUserByID);
app.get('/removefriend/:id', removeFriendByID);
app.get('/findfriends/name/:name', getFriendsByFname);
app.get('/findfriends/fname/:first/:last', getFriendsByFullName);
app.get('/findfriends/email/:email', getFriendsByEmail);
app.get('/addfriend/:id', addFriendByID);

//Admin functions


//view routes
app.get('/email', function(req, res){
  res.sendfile("views/email.html");
});
app.get('/friends', function(req, res){
  res.sendfile("views/friends.html");
});
app.get('/dashboard', function(req, res){
  res.sendfile("views/dashboard.html");
});
app.get('/dashboard/admin', function(req, res){
  res.sendfile("views/dashboardadmin.html");
})

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


var upload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
      now = Date.now().toString();
      require('fs').mkdir('upload/', err => {
        cb(null, 'upload/');
      });
    },
    filename: (req, file, cb) => {
      cb(null, userID + '.ics');
    }
  })
});

app.get('/', function(req, res) {
    //res.sendfile('./views/calander.html');
    res.sendfile('./views/test.html');
});

app.get('/uploadCalendar', function(req, res) {
    res.sendfile('./views/calander.html');
});

app.post('/comparePage', function(req, res) {
    //res.sendfile('./views/calander.html');
    res.sendfile('./views/comparison.html');
});

app.post('/upload', upload.single('calendar_user'), function(req, res, next){
    //var a = routes.convertCal('./upload/coursesCalendar.ics');
    var c =  routes.convertCal('./upload/' + userID +'.ics');
    //var array = [];current_userid = userID;
    console.log(userID)
    var b = routes.processCourse(c, userID);
    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        if (err){
            console.log(error)
        }
        db.collection("timetable").findOne({userid:userID}, function(err,doc){
            if(doc == null){
                try {
                    
                    db.collection("timetable").insertOne({
                        userid: userID,
                        courseSummary: b['courseSummary']
                    }, function(err, doc){
                        console.log(err)
                    })
                    
                    db.close();
                } catch(e){
                    console.log(e);
                }
                
            }

            else{
                db.collection("timetable").findOneAndUpdate({userid: userID}, {courseSummary: b['courseSummary']}, function(err, timetable){
                    if (err) throw err;
                    console.log("Update!")
                    db.close();
                })

            }
        })
    });
    fs.unlinkSync('./upload/' + userID +'.ics');
    res.render('displayCalendar', {array: b['courseSummary']}); 
});  

app.get('/findUser', routes.findOne);

app.post('/tempstore', routes.tempstore);
app.get('/tempget', routes.tempget);

app.get('/compare', routes.compare);

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');
