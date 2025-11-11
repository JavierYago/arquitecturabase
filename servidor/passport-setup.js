const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;


passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: process.env.ClienteID,
    clientSecret: process.env.secret_key,
    callbackURL: process.env.url.concat("/auth/google/callback")
    },
    function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
    }
));

passport.use(
new GoogleOneTapStrategy(
    {
        //client_id
        client_id: process.env.ClienteID,
        //clientSecret
        clientSecret: process.env.secret_key,
        verifyCsrfToken: false, // whether to validate the csrf token or not
    },
    function (profile, done) {
        return done(null, profile);
        }
    )
);