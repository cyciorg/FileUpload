require('dotenv').config()
const express = require('express');
const logger = require('./utils/logger');
const bodyParser = require("body-parser");
const path = require('path')
const resfile = require('./utils/renderFile');
const db = require('./database/mysql');
const routes = [require('./routes/upload'), require('./routes/shorten'), require('./routes/link')]
let extras = {
    webHookDate: null,
    webHookCoolDown: 1500,
    apiText: '/api/v1'
}
const app = express();

function route() {
    //logger.log("Adding routes")
    app.set('trust proxy', 1);
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'views'), {extensions: ['css'],}));
    app.use(bodyParser.text());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.get(`/s/:urlShorten`, routes[2].get.bind(this))
    app.post(`${extras.apiText}/upload`, routes[0].post.bind(this));
    app.post(`${extras.apiText}/shorten`, routes[1].post.bind(this));
    app.get(`/shorten`, routes[1].get.bind(this))
    app.get('/', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        logger.log(`index requested by ${ip} - ${who}`)
        resfile(req, res, "index.ejs") 
    });
}

route();
// logger.error("err");logger.log("Server started on " + process.env.SERVER_PORT);
app.listen(process.env.SERVER_PORT, function(err) {if (err) return })