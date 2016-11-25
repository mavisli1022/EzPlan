var express = require('express');
var bodyParser = require('body-parser');
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
}

//routes
app.get('/login', login);

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');
