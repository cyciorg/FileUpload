
const AmazonCDN = require('../utils/awsConnector');

const formidable = require('formidable');
const fileSettings = require('../utils/fileSettings');
const createID = require('../utils/createID');
const {models} = require('../db/connector');
const mimeType = require('mime-types');
const s3A = new AmazonCDN();

async function post(req, res) {
    res.setHeader('Content-Type', 'text/text');
    
    let form = new formidable.IncomingForm();
    let userHeaderInformation = req.headers;
    let fileName = createID(10);
    //let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.realAddress || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!userHeaderInformation['x-user-email'] || !userHeaderInformation['x-user-id'] && !userHeaderInformation['x-user-api_token']) return res.json({error: `Unauthorized request`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`), 
    //console.log(userHeaderInformation['x-user-id'] + " " + userHeaderInformation['x-user-email']);;
    let account = await models.User.findByEmailOrId({email: userHeaderInformation['x-user-email'], userid: userHeaderInformation['x-user-id']}).then();
    
    if ((account instanceof Error)) return res.json({error: `Unauthorized request. user does not exist.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    if (!account.api_token) return res.json({error: `Unauthorized request. user does not have an api token.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    if (account.api_token !== userHeaderInformation['x-user-api_token']) return res.json({error: `Unauthorized request. user api token does not match.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    if (account.is_banned) return res.json({error: `Unauthorized request. user is banned.`}); // logger.error(`Unauthorized request to /upload/ by ${ip} - ${who}`),
    form.parse(req, async (err, fields, files) => {
        if (err) return res.json({error: `Error parsing form.`});
        if (!files.cyciUploader) return res.json({error: `No file provided.`});
        if (!files.cyciUploader.size) return res.json({error: `File is empty.`});
        if (files.cyciUploader.size > fileSettings.maxFileSize) return res.json({error: `File is too large.`});
        if (files.cyciUploader && !fields.key) {
            files.cyci = files.cyciUploader;
        } else {
            //logger.error(`Non sharex upload requested by ${ip} - ${data[0].name}/${who}`)
            return res.json({error: `Not using Sharex Uploader`})
        }
        let mimeFile = mimeType.extension(files.cyci.mimetype);
        if (!fileSettings.extensions.includes(mimeFile)) return res.json({error: `Invalid mime-type`});
        let file = files.cyci;
        let fileType = file.type;
        let fileSize = file.size;
        let fileName = file.originalFilename;
        let fileData = {
            fileName: fileName,
            fileType: fileType,
            fileSize: fileSize,
            filePath: file.filepath,
            fileExtension: files.cyci.originalFilename.substring(file.originalFilename.lastIndexOf('.') + 1, file.originalFilename.length).toLowerCase()
        };

        // TODO: add rate-limiting and other security measures
        // TODO: add file-type-specific validation
        // TODO: check if user has exceeded their quota

        let fileUpload = await s3A.uploadImage(account, fileData, fileData.filePath);
        fileData.id = fileUpload.id;
        fileData.url = fileUpload.url;
        fileData.fileDateUpload = fileUpload.fileDateUpload;
        models.User.addImageOrFile(account, 
            {name: fileData.fileName, id: fileData.id, value: fileData.url, size: fileData.fileSize, type: fileData.fileExtension, created_at: fileData.fileDateUpload}, function(err, result) {
                if (err) return res.json({error: `Error adding file to database.`}) + console.log(err);
                return res.json({cyciUploader: `https://${fileData.url}`}).status(200)
            });
    });
}

module.exports = { post };