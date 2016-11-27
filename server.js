var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('js-md5');
var MongoClient = require('mongodb').MongoClient;

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

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');
