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
    logger.log(`/UPLOAD/ requested by ${ip} - ${who}`)
    // db.query(`SELECT * FROM userData WHERE token = "${req.headers.authorization}"`, function(err, data) {
    //     if (data == undefined) return res.status(401).json({ error: 'unauthorized' }), logger.error(`Unauthorized request to \`/UPLOAD/\` by ${ip} - ${who}`)
        // TEMP just to see how it plays out with AMAZON-SDK
        form.parse(req, (err, fields, files) => {
            if (err) {
              next(err);
              return;
            }
            let sharex = false;
            if (files.sharexUploader && !fields.key) {
              sharex = true;
              // eslint-disable-next-line no-param-reassign
              files.sharex = files.sharexUploader;
          } else {
            res.json({error: `Not using Sharex Uploader`})
            res.end();
            return;
          }
      
            s3A.uploadImage(createID(10), files.sharex.name, files.sharex.path).then((file) => {
              logger.log(`/UPLOAD/${file} ${ip} - ${who}`);
              res.json({url: file});
              res.end();
              return;
            }).catch((err) => {
              logger.error(err);
            })
          });
    
});

module.exports = router;