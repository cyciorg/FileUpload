
const AmazonCDN = require('../utils/awsConnector');

const formidable = require('formidable');
const fileSettings = require('../utils/fileSettings');
const {models} = require('../db/connector');
const mimeType = require('mime-types');
const s3A = new AmazonCDN();
//const NodeClam = require('clamscan');
//const ClamScan = new NodeClam().init();

async function post(req, res) {
    res.setHeader('Content-Type', 'text/text');
    let form = new formidable.IncomingForm();
    let userHeaderInformation = req.headers;
    //let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.realAddress || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!userHeaderInformation['x-user-email'] || !userHeaderInformation['x-user-id'] && !userHeaderInformation['x-user-api_token']) return res.json({error: `Unauthorized request`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`), 
    let account = await models.User.findByEmailOrId({ email: userHeaderInformation['x-user-email'], userid: userHeaderInformation['x-user-id'] }).then();
    console.log(account)
    if (account.is_banned) return res.json({error: `Unauthorized request. user is banned.`});
    if ((account instanceof Error)) return res.json({error: `Unauthorized request. user does not exist.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    console.log(userHeaderInformation['x-user-api_token'] + " " + account.api_token);
    if (!account.api_token || account.api_token !== userHeaderInformation['x-user-api_token']) return res.json({ error: `Unauthorized request. User does not have an api token. Or api token does not match.` }); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    
    form.parse(req, async (err, fields, files) => {
       // const { scannedFile, isInfected, viruses } = await clamscan.isInfected(files.cyciUploader.filepath);
       // if (isInfected) return res.json({error: `File is infected: ${viruses.join(', ')}`}); // add blacklisting later
        if (err) return res.json({error: `Error parsing form.`});
        if (!files.cyciUploader) return res.json({error: `No file provided.`});
        if (!files.cyciUploader.size) return res.json({error: `File is empty.`});
        if (files.cyciUploader.size > fileSettings.maxFileSize) return res.json({error: `File is too large.`});
        if (!files.cyciUploader && fields.key) return res.json({error: `Not using Sharex Uploader`})
        let mimeFile = mimeType.extension(files.cyciUploader.mimetype);
        if (!fileSettings.extensions.includes(mimeFile)) return res.json({error: `Invalid mime-type`});
        let file = files.cyciUploader;
        let fileData = {
            fileName: file.originalFilename,
            fileType: file.type,
            fileSize: file.size,
            filePath: file.filepath,
            fileExtension: files.cyci.originalFilename.substring(file.originalFilename.lastIndexOf('.') + 1, file.originalFilename.length).toLowerCase()
        };
        // TODO: add rate-limiting and other security measures
        // TODO: add file-type-specific validation
        // TODO: check if user has exceeded their quota
        // TODO: Anti-DDoS measures
        // TODO: Anti-Viral measures almost completed
        let fileUpload = await s3A.uploadImage(account, fileData, fileData.filePath);
        models.User.addImageOrFile(account, 
            {name: fileData.fileName, id: fileUpload.id, value: fileUpload.url, size: fileData.fileSize, type: fileData.fileExtension, created_at: fileUpload.fileDateUpload}, function(err, result) {
                if (err) return res.json({error: `Error adding file to database.`});
                return res.json({cyciUploader: `https://${fileUpload.url}`}).status(200)
            });
    });
}

module.exports = { post };