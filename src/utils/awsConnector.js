var AWS = require('aws-sdk'); 
AWS.config.update({accessKeyId: process.env.AWSS3_ID,secretAccessKey: process.env.AWSS3_KEY});
s3 = new AWS.S3({apiVersion: new Date(Date.now())});
const fs = require('fs');
const promisify = require('util').promisify;
const id = require('./src/utils/createID');
const readFile = promisify(fs.readFile);


let params = {
    Bucket: process.env.AWSS3_BUCKET,
    Key: "",
    Body: "",
    ContentType: 'image/png',
    ACL: 'public-read',
    CacheControl: 'max-age=0',
  }
  // working for local images

class AmazonCDN {
    constructor() {
        this._params = params;
    }
    async uploadToS3(data, fileName, user) {
        const f = fileName.replace(/\W+/g, '-');
        this._params.Key = `${user}/${f}`
        this._params.Body = data;
        return s3.upload(params).promise();
    }
    async uploadImage(path) {
        const data = await readFile(path);
        return uploadToS3(data, id(10), id(10));
      };
}
module.exports = AmazonCDN;