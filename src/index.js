require('dotenv').config();
const express = require('express');
const session = require('express-session');
var MongoStore = require('rate-limit-mongo');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const app = express();

const passport = require('passport');
const path = require('path');
const Mongoose = require('mongoose');
const {
    connectDb
} = require('./db/connector.js');
const User = require('./db/User.schema.js');
const roles = require('./utils/roles.js');
const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
AdminJS.registerAdapter(require('@adminjs/mongoose'))

var compression = require('compression');
const checkAuth = require('./utils/checkAuth.js');
const checkAuthPlusAdmin = require('./utils/checkAuthPlusAdmin.js');
var routesArray = [require('./routes/index.js'), require('./routes/appendUserRole.js'), require('./routes/upload.js'), require('./routes/getConfig.js')];

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

var DiscordStrategy = require('passport-discord').Strategy,
    refresh = require('passport-oauth2-refresh'),
    scopes = ['identify', 'email', 'guilds', 'guilds.join'],
    prompt = 'consent';

var discordStrat = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, cb) {
    profile.refreshToken = refreshToken;
    User.findOrCreate(profile, function(err, user) {
        if (err) return cb(err);
        return cb(profile, user);
    });
    return cb(null, profile);
});

function middleWaresOrSets() {
    passport.use(discordStrat);
    refresh.use(discordStrat);
    app.use(compression());
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.set('trust proxy', 1);
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'views'), {
        extensions: ['css']
    }));
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            new Sentry.Integrations.Http({tracing: true}),
            new Tracing.Integrations.Express({app}),
    ],
        tracesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
}

function routes() {
    middleWaresOrSets();
    app.get('/', routesArray[0].get.bind(this));
    app.get('/api/v1/login', passport.authenticate('discord', {
        scope: scopes,
        prompt: prompt
    }));
    app.get('/api/v1/callback',
        passport.authenticate('discord', {
            failureRedirect: '/'
        }),
        function(req, res) {
            res.redirect('/')
        });
    app.get('/api/v1/logout', function(req, res) {
        req.logout(function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });
    app.get('/api/v1/config', checkAuth, routesArray[3].get.bind(this));
    app.post('/api/v1/upload', routesArray[2].post.bind(this));
    app.get('/api/v1/append-role/:userId', limiter, routesArray[1].post.bind(this));
    app.get('/api/v1/reset-api', routesArray[1].get.bind(this));

    connectDb().then(async (errMongo) => {
        const AdminPanel = new AdminJS({
            resources: [{
                resource: User,
                options: {
                    actions: {
                        delete: {
                            guard: "Are you sure you wish to delete this record?"
                        },
                        regenerateToken: {
                            actionType: 'record',
                            icon: 'View',
                            isVisible: true,
                            component: './adminJsComponents/generateApiComp.jsx',
                            handler: async (req, res, context) => {
                                const user = context.record;
                                const UserAc = context._admin.findResource('UserAccount')
                                const crypto = require('crypto');
                                user.param('api_token').value = crypto.randomBytes(32).toString('hex');
                                return {
                                    record: user.toJSON(context.currentAdmin)
                                }
                            }
                        }
                    },
                    properties: {
                        api_token: {
                            type: 'string',
                            isVisible: {
                                list: true,
                                edit: true,
                                filter: false,
                                show: false,
                            },
                        },
                    },

                }
            }, ],
            branding: {
                companyName: 'Cyci Org',
                logo: 'https://cdn.cyci.rocks/576688747481743/22613_CyciRocks_Rainbowsvg.svg',
                softwareBrothers: false,
                favicon: 'https://cdn.cyci.rocks/576688747481743/22613_CyciRocks_Rainbowsvg.svg',
            },
            rootPath: '/admin',
        })
        const router = AdminJSExpress.buildRouter(AdminPanel, checkAuthPlusAdmin);
        app.use(AdminPanel.options.rootPath, router)
        app.listen(process.env.PORT, function(err) {
            let {
                BruteForce
            } = require('./middleware/bruteForce.js');

            if (err) return console.log(err)

            console.log(`Listening on port ${process.env.PORT}`)

        });
    });
}
routes();