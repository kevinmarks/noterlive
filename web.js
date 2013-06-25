var express = require('express');

var OAuth = require('oauth').OAuth
  , oauth = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      "wJTjmQgifUcO809yfuNkNQ",
      "yRLHDKYaVCpCIRY7n1BajRCuwCJ0XRqg4eULf28uk",
      "1.0",
      "http://www.noterlive.com/auth/twitter/callback",
      "HMAC-SHA1"
    );

var express = require("express");
var app = express();
app.configure(function(){
    app.use(express.static(__dirname + '/web'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    //app.use(express.session({secret:'refulgenceherringglueeffluent'}));

    app.use(express.cookieSession({secret:'refulgenceherringglueeffluent'}));
});

app.get('/auth/twitter', function(req, res) {
 
  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
    if (error) {
      console.log(error);
      res.send("Authentication Failed!");
    }
    else {
      req.session.oauth = {
        token: oauth_token,
        token_secret: oauth_token_secret
      };
      console.log(req.session.oauth);
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
    }
  });
 
});

app.get('/auth/twitter/callback', function(req, res, next) {
 
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth_data = req.session.oauth;
 
    oauth.getOAuthAccessToken(
      oauth_data.token,
      oauth_data.token_secret,
      oauth_data.verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          console.log(error);
          res.send("Authentication Failure!");
        }
        else {
          req.session.oauth.access_token = oauth_access_token;
          req.session.oauth.access_token_secret = oauth_access_token_secret;
          console.log(results, req.session.oauth);
          res.send("Authentication Successful");
          // res.redirect('/'); // You might actually want to redirect!
        }
      }
    );
  }
  else {
    res.redirect('/'); // Redirect to login page
  }
 
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});