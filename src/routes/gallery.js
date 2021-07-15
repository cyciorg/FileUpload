const db = require('../database/mysql');
const logger = require('../utils/logger');
const resfile = require('../utils/renderFile');
var dayjs = require('dayjs');
const escape = require('../database/escaping');
const createToken = require('../utils/createToken');
const checkUser = require('../database/check');
async function get(req, res) {
    resfile(req, res, "gallery.ejs")
}

async function post(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    var shortenInfo = [req.headers];
    if (!req.headers.Authorization && !req.headers.userid) return logger.error(`Unauthorized request to /gallery/ by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
    db.query(`SELECT * FROM userData WHERE token = ?`, [req.headers.authorization], function(dberr, data) {
        if (data == undefined) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /gallery/ by ${ip} - ${who}`)
        if (dberr) return logger.error(`Internal DB error ${err}`)
        const owner = data[0];
        db.query(`SELECT * FROM userUpload WHERE ownerid = ?`, [req.headers.userid], function(dberrGallery, dataGallery) {
            for (let index = 0; index < dataGallery.length; index++) {
                const element = dataGallery[index].siteLocation;
                console.log(element);
                res.redirect(307, `/gallery/${owner.id}/`);
                
            }
            //console.log(dataGallery);
        })
        
    });
    return;
}

module.exports = { get, post };