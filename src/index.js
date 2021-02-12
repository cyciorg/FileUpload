const express = require('express');
const logger = require('../utils/logger');

const app = express();
app.set('trust proxy', 1);

function routes() {
    logger.log("Adding routes")
    app.use('trust proxy');
    app.use('/api/v1', require('./routes/api'))
}

routes();

app.use(function(req, res, next) {
    res.locals.logger = logger;
    next();
})

app.listen(process.env.SERVER_PORT, function(err) {if (err) return logger.error("err");logger.log("Server started on " + process.env.SERVER_PORT);})