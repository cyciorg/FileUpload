const db = require('../database/mysql');
const logger = require('../utils/logger');
const resfile = require('../utils/renderFile');
var dayjs = require('dayjs');
const escape = require('../database/escaping');
const createToken = require('../utils/createToken');
async function get(req, res) {
    resfile(req, res, "gallery.ejs")
}

async function post(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    var shortenInfo = req.body;
    if (!req.body.authorization) return logger.error(`Unauthorized request to /gallery/ by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
    db.query(`SELECT * FROM userData WHERE token = ?`, [req.body.authorization], function(dberr, data) {
        if (data == undefined) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /gallery/ by ${ip} - ${who}`)
        if (dberr) return logger.error(`Internal DB error ${err}`)
        const owner = data[0];
        
    });
    return;
}

module.exports = { get, post };