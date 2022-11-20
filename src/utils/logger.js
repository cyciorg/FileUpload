var winston = require('winston');
var mongoose = require('mongoose');

require('winston-mongodb');

let options = {
    db: mongoose.connection,
}

winston.add(new winston.transports.MongoDB(options));