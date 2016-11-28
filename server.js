var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('js-md5');
var MongoClient = require('mongodb').MongoClient;
var session = require('client-sessions');

var app = express();

var userID = "";

//assets and files
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/views'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
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
                emailverified: false,
                fbconnected: false
              }, function(err, doc){
                //finish everything
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
            db.collection("users").insertOne({
              userid: newID,
              firstname: firstname,
              lastname: lastname,
              email: email,
              password: null,
              emailverified: false,
              fbconnected: true
            }, function(err, doc){
              //finish everything
              userID = newID;
              db.close();
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

}

//routes
app.post('/login', login);
app.post('/signup', signup);
app.post('/signupfb', signupFB);
app.post('/verify', verifyEmail);
app.get('/session', getProfile);

//view routes
app.get('/email', function(req, res){
  res.sendfile("views/email.html");
});

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');
