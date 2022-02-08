
const AmazonCDN = require('../utils/awsConnector');

const formidable = require('formidable');
const fileSettings = require('../utils/fileSettings');
const createID = require('../utils/createID');
const {models} = require('../db/connector');

const s3A = new AmazonCDN();

async function post(req, res) {
    res.setHeader('Content-Type', 'text/text');
    console.log(req);
    let form = new formidable.IncomingForm();
    let userHeaderInformation = req.headers,
    userEmail = userHeaderInformation.xuser-email,
    userID = userHeaderInformation.xuser-id,
    userToken = userHeaderInformation.xuser-api_token;

    let fileName = createID(10);

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!userEmail || !userID && !userToken) return res.json({error: `Unauthorized request`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`), 
    let account = await models.UserAccount.findByEmailOrId({email: userEmail, userid: userID});
    if (!account) return res.json({error: `Unauthorized request. user does not exist.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    if (!account.api_token) return res.json({error: `Unauthorized request. user does not have an api token.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    if (account.api_token !== userToken) return res.json({error: `Unauthorized request. user api token does not match.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    
    
    
    //
    //// models.User.addImageOrFile(account, {name: "fileName", value: "fileName", size: "fileSize", type: "fileType", created_at: "now"});
    //



    // db.query(`SELECT * FROM userData WHERE token = ?`, [req.headers.authorization], function(dberr, data) {
    //     if (data == undefined) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`)
    //     if (data[0].id !== req.headers.userid) return res.status(401).json({error: 'unauthorized'}), logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`)
    //     if (dberr) return logger.error(`Internal DB error ${err}`)
    //     if (!s3A.checkIfUserExists(data[0].id)) return logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`), res.json({error: `Unauthorized request`});
    //     const form = new formidable.IncomingForm();
    //     form.parse(req, async (err, fields, files) => {
    //         if (err) {
    //             next(err);
    //             return;
    //         }
            
    //         // line taken from old project called ShareS
    //         if (files.cyciUploader && !fields.key) {
    //             files.cyci = files.cyciUploader;
    //         } else {
    //             logger.error(`Non sharex upload requested by ${ip} - ${data[0].name}/${who}`)
    //             return res.json({error: `Not using Sharex Uploader`})
    //         }
            
    //         const mimeFile = files.cyci.name.substring(files.cyci.name.lastIndexOf('.') + 1, files.cyci.name.length).toLowerCase();

    //         if (!fileSettings.extensions.includes(mimeFile)) return logger.error(`Invalid mime-type to /upload/ by ${ip} - ${data[0].name}/${who}`), res.json({error: `Invalid mime-type`});
    //         const file = await s3A.uploadImage(data[0].id, files.cyci.name, files.cyci.path);
           
    //         db.query(`INSERT INTO userUpload(id, ownerID, name, siteLocation) VALUES (${createID(30)}, ${data[0].id}, "${file.substring(file.lastIndexOf('/') + 1, file.length)}", "https://${file}");`)
    //         .on('error', err => {
    //             return logger.error(`Could not submit to database. please contact system administrators\n${ip} - ${who}\n${err}`), res.json({error: `DB could not post`});
    //         })
    //         .on('result', resultUpload => {
    //             res.json({cyciUploader: `https://${file}`}).status(200)
    //             logger.log(`${file} uploaded by ${ip} - ${data[0].name}/${who}`, 'log', `https://${file}`);
    //         });
    //         return;
            

    //     });
    // });
    // return;
    return res.json({error: 'Not implemented'});
}

module.exports = { post };