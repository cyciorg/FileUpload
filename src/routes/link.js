const db = require('../database/mysql');
const createID = require('../utils/createID');
const logger = require('../utils/logger');
const renderTemplate = require('../utils/renderFile');
async function get(req, res, next) {
    /**
     <html><head><meta property='og:site_name' content='CyciUploader'>
    <meta property='og:description' content='Cyci's personal fileuploader'>
    <meta name='theme-color' content='#7289DA'>
    <meta property='og:type'content='website'>
    <meta property='og:title' content='Cyci Upload' />
    <meta property='og:image' content='https://cdn.cyci.rocks/576688747481743/user-1.png' >
    <link rel='icon' href='https://cdn.cyci.rocks/576688747481743/index.svg'> </head></html>*/
    res.set("Content-Type", "text/html;");
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!req.params) return res.status(403).json({ error: 'Choose a correct path' });
    db.query(`SELECT * FROM userDataShorten WHERE id="${req.params.urlShorten}"`, function(dberrShort, dataShort) {
        if (dataShort == undefined || !dataShort[0]) return  logger.error(`Unauthorized request to /shorten/ by ${ip} - ${who}`)
        if (dberrShort) return logger.error(`Internal DB error ${err}`)
        var entireLink = dataShort[0]
        res.status(301).redirect(entireLink.shorten)
        const dayjs = require('dayjs')
        const timestamp = dayjs(new Date()).format("YYYY,MM,DD");
        db.query(`UPDATE userData SET visits=JSON_ARRAY_APPEND(visits, '$.${timestamp}', '{'${timestamp}': {'${ip}': {'who': {'${createID(20)}': "${who}"}}}}') WHERE id="${entireLink.id}"`).on('error', (err)=> {
            console.log(err);
        })
    })
}

module.exports = { get }