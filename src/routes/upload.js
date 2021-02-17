const express = require('express');
const db = require('../database/mysql');
const AmazonCDN = require('../utils/awsConnector');
const logger = require('../utils/logger');
router = express.Router();
const formidable = require('formidable');
const createID = require('../utils/createID');

const s3A = new AmazonCDN();

router.post('/upload', async function(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
    const form = new formidable.IncomingForm();
    if (!req.headers.authorization && !req.headers.userid) return logger.error(`Unauthorized request to \`/UPLOAD/\` by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
    db.query(`SELECT * FROM userData WHERE token = "${req.headers.authorization}"`, function(dberr, data) {
        if (data == undefined) return res.status(401).json({ error: 'unauthorized' }), logger.error(`Unauthorized request to \`/UPLOAD/\` by ${ip} - ${who}`)
        if (data[0].id !== req.headers.userid)
        if (dberr) return logger.error(`Internal DB error ${err}`)
        if (!s3A.checkIfUserExists(data[0].id)) return logger.error(`Unauthorized request to \`/UPLOAD/\` by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
        //TEMP just to see how it plays out with AMAZON-SDK
        form.parse(req, (err, fields, files) => {
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
            res.json({error: `Not using Sharex Uploader`})
            res.end();
            return;
          }

            s3A.uploadImage(data[0].id, files.cyci.name, files.cyci.path).then((file) => {
              logger.log(`${file} uploaded by ${ip} - ${who}`);
              db.query(`UPDATE userData SET fileLink=COALESCE(JSON_ARRAY_APPEND(fileLink, '$', '${file}'), JSON_ARRAY('${file}'))`).on('error', function (errorS) {
                console.log(errorS);
              })
              res.json({url: "https://" + file});
              res.end();
              return;
            }).catch((err) => {
              logger.error(err);
            })
          });
      });
});

module.exports = router;