var AWS = require('aws-sdk'); 
AWS.config.update({accessKeyId: process.env.AWSS3_ID,secretAccessKey: process.env.AWSS3_KEY});
s3 = new AWS.S3({apiVersion: new Date(Date.now())});
const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
var mime = require('mime-types')
const createID = require('./createID');


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
        this._s3 = s3;
    }
    async uploadImage(user, imageName, path) {
        const data = await readFile(path);
        const dataS3 = this.uploadToS3(data, imageName, user)
        await dataS3.upload;
        return dataS3.file;
      };
    uploadToS3(data, fileName, user) {
        let newID = createID(5);
        const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase();
        let mimeType = mime.lookup(fileExt);
        this._params.Key = `${user}/${newID}_${fileName}`, this._params.Body = data,this._params.ContentType = mimeType;
        return {
        upload: this._s3.upload(this._params).promise(),
        file: process.env.SERVER + `/${this._params.Key}`
      }
    }
    /**
     * @param {Int} userId
     */
    async checkIfUserExists(userId) {
      const paramFolder = {Bucket: process.env.AWSS3_BUCKET,Prefix: `${userId}/`}
      s3.listObjectsV2(paramFolder, function(err, data) {
        const folderExists = data.Contents.length > 0;
          if (folderExists == true) {
            return true;
          } else return false;
      })
    }
}
module.exports = AmazonCDN;