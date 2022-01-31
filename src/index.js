require('dotenv').config();
const express = require('express');
const session  = require('express-session');
const app = express();
const passport = require('passport');
const path = require('path');

const { connectDb, models } = require('./db/connector.js');
var compression = require('compression');
const checkAuth = require('./utils/checkAuth.js');
var routesArray = [require('./routes/index.js')];

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


var DiscordStrategy = require('passport-discord').Strategy
  , refresh = require('passport-oauth2-refresh')
  , scopes = ['identify', 'email', 'guilds', 'guilds.join']
  , prompt = 'consent';

var discordStrat = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: scopes,
    prompt: prompt
},
function(accessToken, refreshToken, profile, cb) {
    profile.refreshToken = refreshToken; // store this for later refreshes
    models.User.findOrCreate(profile, (err, profile) => {
      if (err) return cb(err);
      return cb(null, profile);
    });
    return cb(null, profile);
});

function middleWaresOrSets() {
  passport.use(discordStrat);
  refresh.use(discordStrat);
  app.use(compression())
  // req.isAuthenticated is provided from the auth router
  app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'views'), {extensions: ['css'],}));
}

function routes() {
  middleWaresOrSets();
  app.get('/', routesArray[0].get.bind(this))
  app.get('/api/v1/login', passport.authenticate('discord', {
      scope: scopes,
      prompt: prompt
  }), function(req, res) {});
  app.get('/api/v1/callback',
      passport.authenticate('discord', {
          failureRedirect: '/'
      }),
      function(req, res) {
          res.redirect('/')
      } // auth success
  );
  app.get('/api/v1/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
  app.get('/info', checkAuth, function(req, res) {
      //console.log(req.user)
      res.json(req.user);
  });

  connectDb().then(async () => {
      app.listen(process.env.PORT, function(err) {
          if (err) return console.log(err)
          console.log(`Listening on port ${process.env.PORT}`)
      })
  });
}



routes();