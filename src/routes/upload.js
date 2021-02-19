const express = require('express');
const db = require('../database/mysql');
const AmazonCDN = require('../utils/awsConnector');
const logger = require('../utils/logger');
router = express.Router();
const formidable = require('formidable');
const fileSettings = require('../utils/fileSettings');

const s3A = new AmazonCDN();

router.post('/upload', async function(req, res) {
    res.setHeader('Content-Type', 'text/text');
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!req.headers.authorization && !req.headers.userid) return logger.error(`Unauthorized request to /UPLOAD/ by ${ip} - ${who}`), res.json({
        error: `Unauthorized request`
    });
    db.query(`SELECT * FROM userData WHERE token = "${req.headers.authorization}"`, function(dberr, data) {
        if (data == undefined) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /UPLOAD/ by ${ip} - ${who}`)
        if (data[0].id !== req.headers.userid) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /UPLOAD/ by ${ip} - ${who}`)
        if (dberr) return logger.error(`Internal DB error ${err}`)
        if (!s3A.checkIfUserExists(data[0].id)) return logger.error(`Unauthorized request to /UPLOAD/ by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
        const form = new formidable.IncomingForm();
        //TEMP just to see how it plays out with AMAZON-SDK
        form.parse(req, async (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            // line taken from old project called ShareS
            let sharex = false;
            if (files.cyciUploader && !fields.key) {
                sharex = true;
                files.cyci = files.cyciUploader;
            } else {
                logger.error(`Non sharex upload requested by ${ip} - ${data[0].name}/${who}`)
                return res.json({error: `Not using Sharex Uploader`})
            }
            const mimeFile = files.cyci.name.substring(files.cyci.name.lastIndexOf('.') + 1, files.cyci.name.length).toLowerCase();

            if (!fileSettings.extensions.includes(mimeFile)) return logger.error(`Invalid mime-type to /UPLOAD/ by ${ip} - ${data[0].name}/${who}`), res.json({error: `Invalid mime-type`});
            const file = await s3A.uploadImage(data[0].id, files.cyci.name, files.cyci.path);
            let checkIfImg = JSON.parse(data[0].fileLink);
           
            if (checkIfImg !== null && checkIfImg.includes(file)) {
                res.json({cyciUploader: `https://${file}`}).status(200)
                logger.log(`${file} reupload by ${ip} - ${data[0].name}/${who}`);
                return;
            } else {
                db.query(`UPDATE userData SET fileLink=COALESCE(JSON_ARRAY_APPEND(fileLink, '$', '${file}'), JSON_ARRAY('${file}')) WHERE id=${data[0].id}`);
                res.json({cyciUploader: `https://${file}`}).status(200)
                logger.log(`${file} uploaded by ${ip} - ${data[0].name}/${who}`);
                return;
            }

        });
    });
    return;
});

module.exports = router;