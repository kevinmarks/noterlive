var express = require('express');
var consumerKey = process.env.TWITTER_CONSUMER_KEY;
var consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
var appRoot = process.env.APP_ROOT || "localhost:5000";
var OAuth = require('oauth').OAuth
  , oauth = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      consumerKey,
      consumerSecret,
      "1.0",
      appRoot + "/auth/twitter/callback",
      "HMAC-SHA1"
    );

var twitter = require('twitter-api').createClient();

var app = express();
app.configure(function(){
    app.use(express.static(__dirname + '/web'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
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

app.get('/auth/twitterlogout', function(req, res) {
  // Only destroys the session, doesn't revoke the key.
  // Twitter doesn't have an API for user-level revocation.
  req.session = null;
  res.redirect('/');
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
          //res.send("Authenticated <a href='/showuser'>as</a>");
          twitter.setAuth ( 
                consumerKey,
                consumerSecret, 
                req.session.oauth.access_token,
                req.session.oauth.access_token_secret 
            );

            twitter.get( 'account/verify_credentials', { skip_status: true }, function( user, error, status ){
                console.log( user ? 'Authenticated as @'+user.screen_name : 'Not authenticated' );
               req.session.user = user;
               //console.log(req.session);
               //res.send("Logged in as @"+user.screen_name);
               res.redirect('/'); 
            } );
        }
      }
    );
  }
  else {
    res.redirect('/'); // Redirect to login page
  }
 
});

app.post('/auth/indie', function(req, res, next) {
	console.log("indieauth: "+ req.body.yoururl);
});

app.get('/sendtweet', function(req, res, next) {
    console.log("sendtweet: " + req.query.status + twitter.hasAuth);
	twitter.setAuth ( 
        consumerKey,
        consumerSecret, 
        req.session.oauth.access_token,
        req.session.oauth.access_token_secret 
    );
	if ( twitter.hasAuth() ) {
	   twitter.post('statuses/update',{'status':req.query.status}, function( tweet, error, status ){
					console.log( tweet ? 'posted as @'+tweet.user.screen_name : status+" "+error.message );               
				   res.send(tweet ? "<a href='https://twitter.com/" +tweet.user.screen_name+"/status/"+
						tweet.id_str+"'>"+tweet.text+"</a>":status+ + error.message );
				} );
    } else {
        res.send("<a href='/auth/twitter'>login first </a>");
    } 
        
});

app.get('/showuser', function(req, res, next) {
    if (req.session.user) {
	var data = {"profileImage":req.session.user.profile_image_url, "screenName": req.session.user.screen_name, "fullName": req.session.user.name };
	res.send(data);
    } else {
         res.send("not logged in");
    }
});

app.get('/lookupspeaker', function(req, res, next) {
        speaker = {'twitter':'@t', 'url':'http://tantek.com', 'name':'Tantek Çelik' };
       twitter.setAuth ( 
            consumerKey,
            consumerSecret, 
            req.session.oauth.access_token,
            req.session.oauth.access_token_secret 
        );
        twitter.get('users/show',{'screen_name':req.query.handle}, function (user, error, status ) {
            if (user) {
				speaker.twitter = '@' + user.screen_name;
				speaker.name = user.name;
				speaker.url = user.entities.url ? user.entities.url.urls[0].expanded_url :"";
				speaker.url = speaker.url ? speaker.url : 'https://twitter.com/' + speaker.twitter;
			}
            astxt = JSON.stringify(speaker);
            res.send(astxt);
        });
});
    
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
