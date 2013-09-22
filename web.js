var auth = new require('./auth');

var consumerKey = auth.consumerKey;
var consumerSecret = auth.consumerSecret;

var OAuth = require('oauth').OAuth
    , oauth = new OAuth(
        "https://api.twitter.com/oauth/request_token",
        "https://api.twitter.com/oauth/access_token",
        consumerKey,
        consumerSecret,
        "1.0",
        "http://noterlive.rphh.org:5000/auth/twitter/callback",
        "HMAC-SHA1"
    );

var twitter = require('twitter-api').createClient();

var express = require("express");
var app = express();
app.configure(function () {
    app.use(express.static(__dirname + '/web'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    //app.use(express.session({secret:'refulgenceherringglueeffluent'}));

    app.use(express.cookieSession({secret: 'refulgenceherringglueeffluent'}));
});

app.get('/auth/twitter', function (req, res) {

    oauth.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
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
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
        }
    });

});

app.get('/auth/twitter/callback', function (req, res, next) {

    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth_data = req.session.oauth;

        oauth.getOAuthAccessToken(
            oauth_data.token,
            oauth_data.token_secret,
            oauth_data.verifier,
            function (error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    console.log(error);
                    res.send("Authentication Failure!");
                }
                else {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth.access_token_secret = oauth_access_token_secret;
                    console.log(results, req.session.oauth);
                    //res.send("Authenticated <a href='/showuser'>as</a>");
                    twitter.setAuth(
                        consumerKey,
                        consumerSecret,
                        req.session.oauth.access_token,
                        req.session.oauth.access_token_secret
                    );

                    twitter.get('account/verify_credentials', { skip_status: true }, function (user, error, status) {
                        console.log(user ? 'Authenticated as @' + user.screen_name : 'Not authenticated');
                        req.session.user = user;
                        //console.log(req.session);
                        //res.send("Logged in as @"+user.screen_name);
                        res.redirect('/');
                    });
                }
            }
        );
    }
    else {
        res.redirect('/'); // Redirect to login page
    }

});

app.get('/sendtweet', function (req, res, next) {
    console.log("sendtweet: " + req.query.status);
    twitter.post('statuses/update', {'status': req.query.status}, function (tweet, error, status) {
        console.log(tweet ? 'posted as @' + tweet.user.screen_name : 'Not authenticated');
        res.send(tweet ? "<a href='https://twitter.com/" + tweet.user.screen_name + "/status/" +
            tweet.id_str + "'>" + tweet.text + "</a>" : "<a href='/auth/twitter'>login first</a>");
    });
});

app.get('/showuser', function (req, res, next) {
    if (req.session.user) {
        res.send("<img src='" + req.session.user.profile_image_url + "'> logged in as @" + req.session.user.screen_name);
    } else {
        res.send("not logged in");
    }
});

app.get('/lookupspeaker', function (req, res, next) {
    console.log('Changing speaker: ' + req.query.handle);
    args = { 'include_entities': 'true', 'screen_name': req.query.handle};
    twitter.get('users/lookup', args, function (data, error, code) {
        console.log(data);
        console.log(error);
        console.log(code);
        res.send(data ? data[0] : "");
    });
});


var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on " + port);
});
