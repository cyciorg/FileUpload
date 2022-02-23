require('dotenv').config();
const express = require('express');
const session  = require('express-session');
const app = express();
//var helmet = require('helmet')
const passport = require('passport');
const path = require('path');
const Mongoose = require('mongoose');
const { connectDb, models } = require('./db/connector.js');
var compression = require('compression');
const checkAuth = require('./utils/checkAuth.js');
var routesArray = [require('./routes/index.js'), require('./routes/appendUserRole.js'), require('./routes/upload.js'), require('./routes/getConfig.js')];

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
  app.use(express.static(path.join(__dirname, 'views'), {extensions: ['css']}));
  // app.locals.models = models;
  // app.locals.roles = require('./utils/roles');
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
  let middlewareArray = [checkAuth]
  app.get('/api/v1/config', middlewareArray, routesArray[3].get.bind(this));
  app.post('/api/v1/upload', routesArray[2].post.bind(this));
  app.get('/api/v1/append-role/:userId', routesArray[1].post.bind(this));

  connectDb().then(async (errMongo) => {
    //if (errMongo) return console.log(errMongo);
    // if (errMongo) {
    //   // TODO: implement error handling
    //   console.log(errMongo);
    // } else {
      app.listen(process.env.PORT, function(err) {
          let {BruteForce} = require('./middleware/bruteForce.js');
          
          if (err) return console.log(err)
          // let bruteforce = new BruteForce(Mongoose.connection);
          // app.use(bruteforce.rateLimiterMiddleware2);
          console.log(`Listening on port ${process.env.PORT}`)
      })
    //}
  });
}

routes();