const db = require('../database/mysql');
const logger = require('../utils/logger');
const resfile = require('../utils/renderFile');
var dayjs = require('dayjs');
const escape = require('../database/escaping');
const createToken = require('../utils/createToken');
async function get(req, res) {
    resfile(req, res, "shorten.ejs")
}

async function post(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    var shortenInfo = req.body;
    if (!req.body.authorization) return logger.error(`Unauthorized request to /shorten/ by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
    db.query(`SELECT * FROM userData WHERE token = "${req.body.authorization}"`, function(dberr, data) {
        if (data == undefined) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /shorten/ by ${ip} - ${who}`)
        if (dberr) return logger.error(`Internal DB error ${err}`)
        const owner = data[0];
        db.query(`SELECT * FROM userDataShorten WHERE shorten="${shortenInfo.url}"`, function(dberrShort, dataShort) {
            if (dataShort == undefined || dataShort[0]) return res.status(401).json({error: 'Data Exists', url: `https://${process.env.SHORTEN_SERVER}/s/${dataShort[0].id}`}), logger.log(`request to /shorten/ by ${ip} - ${who}`);
            if (dberrShort) return logger.error(`Internal DB error ${err}`)
            const timestamp = dayjs(new Date()).format("YYYY,MM,DD");
            var shortenURL = createToken(6);
            db.query(`INSERT INTO userDataShorten (id, ownerID, shorten, created, visits) VALUES ("${shortenURL}", ${owner.id}, ${escape(shortenInfo.url)}, "${timestamp}", "[]")`).on('error', (err) => {return res.json({error: `Did not post to the DB contact staff@cyci.org`}), logger.error(`Bad upload to /shorten/ by ${ip} - ${owner.name}/${who} ${err}`)})
            .on('result', (info) => {return logger.log(`Shortened URL! https://${process.env.SHORTEN_SERVER}/s/${shortenURL} - ${ip} - ${owner.name}/${who}`)})
       })
    });
    return;
}

module.exports = { get, post };