const db = require('../database/mysql');
const createID = require('../utils/createID');
const logger = require('../utils/logger');
const renderTemplate = require('../utils/renderFile');
async function get(req, res, next) {
    res.set("Content-Type", "text/html;");
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!req.params) return res.status(403).json({ error: 'Choose a correct path' });
    db.query(`SELECT * FROM userDataShorten WHERE id="${req.params.urlShorten}"`, function(dberrShort, dataShort) {
        if (dataShort == undefined || !dataShort[0]) return  logger.error(`Unauthorized request to /shorten/ by ${ip} - ${who}`)
        if (dberrShort) return logger.error(`Internal DB error ${err}`)
        var entireLink = dataShort[0]
        res.status(301).redirect(entireLink.shorten)
        const dayjs = require('dayjs')
        const timestamp = dayjs(new Date()).format("YYYY-MM-DD");
        var fullIp = ip.length > 1 ? ip.replace(', ', '-') : ip
        db.query(`UPDATE userDataShorten SET visits=JSON_ARRAY_APPEND(visits, '$', '{${timestamp}: {who: {ip: ${fullIp}, header: ${who}}}}') WHERE id="${entireLink.id}"`).on('error', (err)=> {
            console.log(err);
        })
    })
}

module.exports = { get }