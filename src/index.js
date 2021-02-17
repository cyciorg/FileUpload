const express = require('express');
const logger = require('./utils/logger');
let extras = {
    webHookDate: null,
    webHookCoolDown: 1500
}

const app = express();

function routes() {
    logger.log("Adding routes")
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use('/api/v1', require('./routes/upload'))
    app.get('/', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        logger.log(`index requested by ${ip} - ${who}`)
        res.json({result: "frontpage W.I.P bare with us!"});
    });

}

routes();

app.use(function(req, res, next) {
    res.locals.logger = logger;
    res.locals.extras = extras;
    next();
})

app.listen(process.env.SERVER_PORT, function(err) {if (err) return logger.error("err");logger.log("Server started on " + process.env.SERVER_PORT);})