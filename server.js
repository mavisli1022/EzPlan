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
  FB.api('oauth/access_token', {
    client_id: '1805734163039739',
    client_secret: '73b4f636ff95370492d9cd41a3e828c3',
    grant_type: 'client_credentials'
  }, function (resp) {
      if(!resp || res.error) {
          console.log(!resp ? 'error occurred' : resp.error);
          return;
      }

      var accessToken = resp.access_token;
      res.send(accessToken);
  });
}

//routes
app.get('/login', login);

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');
