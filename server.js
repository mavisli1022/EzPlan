var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('js-md5');
var MongoClient = require('mongodb').MongoClient;
var session = require('client-sessions');
var nodemailer = require('nodemailer');
var fs = require('fs');
var multer = require('multer');
var routes = require('./routes.js');
var transporter = nodemailer.createTransport('smtps://shrey.kumar.ca%40gmail.com:8809asAS@smtp.gmail.com');

var app = express();

var userID = "";


app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: false
}));

app.set('view engine', 'pug');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));




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

//define session variable
app.use(session({
  cookieName: 'session',
  secret: 'ezplansecret',
  duration: 9000000,
  activeDuration: 9000000
}))


/* User log in*/
function login(req, res){
  var email = req.body.email;
  var password = req.body.password;

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err)}
    db.collection("users").findOne({
      email: email,
      password: md5(password)
    }, function(err, doc){
      var ret = {"errors": [], "userID": ""};
      if(doc == null){
        ret.errors = "Username and Password not found.";
        res.send(ret);
      } else {
        //login here
        ret.userID = doc.userid;
        userID = doc.userid;
        ret.errors = "done";
        res.send(ret);
      }

    })

  });
}

/*User sign up*/
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
    if(err){ res.send(err) }
    db.collection("users").count({email: email}, function(error, num){
      if(error){ res.send(error) }
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
          field: "signup-email",
          msg: "Invalid Email."
        });
      }

      if(password != confirmpwd){
        ret.errors.push({
          field: ["pwd", "confirmpwd"],
          msg: "Passwords do not match."
        })
      } else if(!validPwd.test(password)){
        ret.errors.push({
          field: "pwd",
          msg: "Please enter a valid password.<br /> Passwords must include 1 uppercase, 1 lowercase, 1 special character and must have a minimum length of 5"
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
                discoverable: true,
                emailverified: false,
                fbconnected: false
              }, function(err, doc){
                //finish everything

                if(err){ res.send(err)}
                db.collection("friends").insertOne({
                  userid: newid,
                  friends: []
                }, function(err, doc){
                  userID = newid;
                  db.close();
                })

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

/*User sign up by Facebook account*/
function signupFB(req, res){
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var fbID = req.body.fbid;
  var friends = [];

  var totalKeys = Object.keys(req.body);
  var totallength = -1;
  for(var i = 0; i < totalKeys.length; i++){
    if(totalKeys[i].includes("friends")){
      var thisIndex = totalKeys[i].substring(8, 9);
      var thisAttr = totalKeys[i].substring(10);
      var thisValue = req.body[totalKeys[i]];


      if(friends[thisIndex] == null){
        //create object
        friends[thisIndex] = {};
        friends[thisIndex].name = thisValue;
      } else {
        //add to prev object
        friends[thisIndex].id = thisValue;
      }
    }
  }

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){res.send(err)}
    db.collection("users").count({email: email}, function(error, num){
      var ret = {"errors": [], "userID":""};
      if(error){ ret.errors.push(error); }
      if(num > 0){
        //email already registered
        //just log them in
        db.collection("users").findOne({
          email: email
        }, function(err, doc){
          if(err){
            ret.errors.push(err);
            res.send(ret);
          }
          ret.userID = doc.userid;
          userID = doc.userid;
          res.send(ret);
        })


      } else {
        db.collection("users").find().sort({"userid":-1}).limit(1).forEach(function(doc){
          try {
            var newID = doc.userid + 1;
            ret.userID = newID;
            console.log(fbID);
            db.collection("users").insertOne({
              userid: newID,
              firstname: firstname,
              lastname: lastname,
              email: email,
              password: null,
              level: "user",
              emailverified: false,
              discoverable: true,
              fbconnected: true,
              fbID: fbID
            }, function(err, doc){
              //populate friends list
              ret.errors.push(err);
              console.log("init total friends");
              var totalFriends = [];
              for(var i = 0; i < friends.length; i++){
                db.collection("users").findOne({
                  fbID: friends[i].id
                }, function(err, doc){
                  ret.errors.push(err);
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
                  if(err){console.log(err); ret.errors.push(err)}

                  userID = newID;
                  db.close();
                })
              }, 500);
              res.send(ret);

            })
          } catch(e){
            console.log(e);
          }
        });
      }
    }); //end users search
  }); //end mongo connet
}

/*Get current user profile*/
function getProfile(req, res){
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var userid = userID;
    db.collection("users").findOne({userid: userid}, function(error, doc){
      if(error){ console.log(error); ret.errors.push(error); }
      res.send(doc);
      db.close();
    });
  });
}

/*Verify user email address*/
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

/*Show timetable for current user*/
function showtt(req, res){
  var b;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
      if (err){
        res.send(err);
      }
      db.collection("timetable").findOne({userid:userID}, function(err,doc){
        b = doc.courseSummary
        res.render('displayCalendar', {array: b});
        //return doc.courseSummary;
      })
      db.close();
  });
}




/*Get current user's friends list*/
function getFriends(req, res){
  var sessionUser = userID;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err); }
    db.collection("friends").findOne({
      userid: sessionUser
    }, function(err, doc){
      if(err){ res.send(err); }
      res.send(doc);
    })
  });

}

/*Search user by user id*/
function getUserByID(req, res){
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var currentID = req.params.id;
    var query = {
      userid: parseInt(currentID)
    }
    db.collection("users").findOne(query, function(err, doc){
      if(err){ res.send(err)};
      res.send(doc);
      db.close();
    })
  });
}

/*Remove friends by user ID*/
function removeFriendByID(req, res){
  var sessionID = userID;
  var currentID = parseInt(req.params.id);
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err);}
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
        if(err){ res.send(err)}
        res.redirect('/friends');
        db.close();
      });
  });
}

/*Get friends by their first name*/
function getFriendsByFname(req, res){
  var name = req.params.name;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err)}
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

/*Get friends by their email address*/
function getFriendsByEmail(req, res){
  var email = req.params.email;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err)}
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

/*Get friends by their full name*/
function getFriendsByFullName(req, res){
  var firstname = req.params.first;
  var lastname = req.params.last;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err)}
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

/* Add user by user ID*/
function addFriendByID(req, res){
  //check if user already a friend, if not add it in
  var friendID = req.params.id;
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    if(err){ res.send(err)}
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
        res.send(err);
      }
    })

  });


}

/*Get all users*/
function getAllUsers(req, res){
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    var ret = [];
    db.collection("users").find().forEach(function(doc, err){
      if(err){ res.send(err)}
      ret.push(doc);
    })
    setTimeout(function(){
      res.send(ret);
    }, 500);
  });
}

/*Get user's friends*/
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


/*Confirm user's email*/
function confirmEmail(req, res){
  var code = req.params.code;

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("users").find().forEach(function(doc, err){
      if(md5(doc.email) == code){
        //register session and set verify to true
        userID = doc.userid;
        db.collection("users").update(
          {userid: userID},
          {$set: {emailverified: true}},
          function(err, doc){
            console.log("hello there");
            if(!err){
              //redirect to dashboard here
              console.log(userID);
              db.collection("users").findOne({
                userid: parseInt(userID)
              }, function(err, doc){
                console.log(err);
                console.log(doc);
                if(doc.level == "user"){
                  res.sendfile("views/mainPage.html");
                } else {
                  res.sendfile("views/dashboardadmin.html");
                }
              })
            } else {
              res.send(err);
            }
          }
        )
      }
    })
  });
}

/*set discoverability for user*/
function toggleDiscoverability(req, res){
  var changed;
  if(req.params.changed == "true"){
    changed = true;
  } else {
    changed = false;
  }
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("users").update(
      {userid: parseInt(userID)},
      {$set: {discoverable: changed}},
      function(err, doc){
        if(err){
          res.send(err);
        } else {
          res.send("done");
        }
      }
    );
  });
}

/*change users password*/
function changePwd(req, res){
  var pwd = req.body.current;
  var newpwd = req.body.newPass;
  var confpwd = req.body.confPass;
  var ret = {errors: []};

  var validPwd = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{5,}$/;

  if(pwd == newpwd){
    ret.errors.push({
      field: ["prevpass", "newpass"],
      msg: "Your new password cannot be the same as your old one!"
    })
  }

  if(!validPwd.test(newpwd)){
    ret.errors.push({
      field: "newpass",
      msg: "Invalid Password! Passwords must include at least 1 special character, 1 number, 1 uppercase, 1 lowercase letter and must be at least 5 characters in length"
    })
  } else if(newpwd != confpwd){
    ret.errors.push({
      field: ["newpass", "newpassconf"],
      msg: "Passwords dont match."
    })
  }

  //find if password is same
  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("users").findOne({
      userid: userID
    }, function(err, doc){
      if(doc.password != md5(pwd)){
        console.log(ret.errors);
        ret.errors.push({
          field: "prevpass",
          msg: "Your current password does not match! Please try again."
        })
      }
    })
  });

  if(ret.errors.length == 0){
    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
      db.collection("users").update(
        {userid: parseInt(userID)},
        {$set: {password: md5(newpwd)}},
        function(err, doc){
          if(!err){
            ret.errors = "done";
          } else {
            ret.errors.push({
              field: "err",
              msg: err
            })
          }
        }
      )
    });
  }


  setTimeout(function(){
    res.send(ret);
  }, 500);

}

/*Edit user's profile*/
function editProfile(req, res){
  var first = req.body.firstname;
  var last = req.body.lastname;
  var email = req.body.email;
  var verified = false;
  var ret = {errors: []};

  MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    //change the name regardless
    db.collection("users").update(
      {userid: parseInt(userID)},
      {$set: {firstname: first, lastname: last}},
      function(err, doc){
        if(err){
          ret.errors.push(err);
        } else {
          ret.errors.push("name added");

          db.collection("users").findOne(function(err, doc){
            //current email
            if(doc.email == email && doc.emailverified){
              verified = true;
            } else {
              verified = false;
            }
          })

          db.collection("users").count({
            email: email
          }, function(err, count){
            if(err){
              ret.errors.push(err);
            } else {
              if(count == 0){
                //check email format first
                var validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(!validEmail.test(email)){
                  ret.errors.push({
                    field: email,
                    msg: "Invalid Email"
                  })

                } else {
                  //no other email exists, take this email
                  db.collection("users").update(
                    {userid: parseInt(userID)},
                    {$set: {emailverified: verified, email: email}},
                    function(err, doc){
                      if(err){
                        ret.errors.push(err)
                      } else {
                        ret = "done";
                      }
                    }
                  );
                }

              } else {
                //email taken
                ret.errors.push({
                  field: "email",
                  msg: "Email taken."
                })
              }
            }
          })
        }
      });

      setTimeout(function(){
        res.send(ret);
      }, 500);

    });
}

/*Log out current user*/
function logout(req, res){
  userID = "";
  res.redirect("/");
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
app.post('/toggledisc/:changed', toggleDiscoverability);
app.post('/changepwd', changePwd);
app.post('/edit', editProfile);
app.get('/logout', logout);
app.get('/users', getAllUsers);
app.get('/timetable', showtt);
app.get('/findUser', routes.findOne);
app.post('/tempstore', routes.tempstore);
app.get('/tempget', routes.tempget);
app.post('/addUser', routes.addUser);
app.post('/delUser', routes.delUser);
app.post('/updateUser', routes.updateUser);
app.get('/recommendedFriendsGet', routes.recommendedFriends);
app.get('/searchCourseGet', routes.searchClassmates);
app.get('/allUsers', routes.allUsers);


app.get('/compare', routes.compare);
//view routes
app.get('/recommendedFriends', function(req, res) {
    res.sendfile('views/recommendedFriends.html');
});
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
app.get('/profile', function(req, res){
  res.sendfile("views/profile.html");

});
app.get('/dashboard/admin-view', function(req, res){
  res.sendfile("views/viewallusers.html");
})

app.get('/dashboard/admin-adduser', function(req, res){
  res.sendfile("views/addUser.html");
})

app.get('/dashboard/admin-delete', function(req, res){
  res.sendfile("views/deleteuser.html");
})

app.get('/dashboard/admin-update', function(req, res){
  res.sendfile("views/updateuser.html");
})

app.get('/searchCourse', function(req, res){
    res.sendfile("views/searchCourse.html");
})

app.get('/uploadCalendar', function(req, res) {
    res.sendfile('./views/calander.html');
});

app.post('/comparePage', function(req, res) {
    res.sendfile('./views/comparison.html');
});

app.post('/main', function(req, res) {
    res.sendfile('./views/mainPage.html');
});

app.post('/admin', function(req, res) {
    res.sendfile('./views/dashboardadmin.html');
});


app.post('/upload', upload.single('calendar_user'), function(req, res, next){
    var c =  routes.convertCal('./upload/' + userID +'.ics');
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
                db.collection("timetable").remove({userid: userID}, function(err, doc){
                  console.log(err);
                })
                db.collection("timetable").insertOne({
                  userid: userID,
                  courseSummary: b['courseSummary']
                }, function(err, doc){
                   console.log(err)

                db.collection("timetable").findOneAndUpdate({userid: userID}, {userid: userID, courseSummary: b['courseSummary']}, function(err, timetable){
                    if (err) throw err;
                    console.log("Update!")
                    db.close();

                })

            });
          }
      });
    });
    fs.unlinkSync('./upload/' + userID +'.ics');
    res.render('displayCalendar', {array: b['courseSummary']});
});



app.get('/getUserID', function(req, res){
  console.log(userID);
  var data= userID.toString();
  res.send(data);
});

app.listen(process.env.PORT || 3000);

console.log('Listening on port 3000');

