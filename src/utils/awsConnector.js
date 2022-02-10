var AWS = require('aws-sdk'); 
AWS.config.update({accessKeyId: process.env.AWSS3_ID,secretAccessKey: process.env.AWSS3_KEY});
s3 = new AWS.S3({apiVersion: new Date(Date.now())});
const { readFile } = require("fs/promises");
var mime = require('mime-types')
const createID = require('./createID');
var dayjs = require('dayjs');
var now = dayjs()
let params = {
    Bucket: process.env.AWSS3_BUCKET,
    Key: "",
    Body: "",
    ContentType: 'image/png',
    ACL: 'public-read',
    CacheControl: 'max-age=0',
  }
class AmazonCDN {
    constructor() {
        this._params = params;
        this._s3 = s3;
    }
    async uploadImage(user, fileData, path) {
        const data = await readFile(path);
        const dataS3 = this.uploadToS3(data, fileData, user)
        await dataS3.upload;
        return {url: dataS3.file, id: dataS3.id, fileDateUpload: dataS3.fileDateUpload};
      };
    uploadToS3(data, fileData, user) {
        let newID = createID(10);
        const fileExt = fileData.fileExtension;
        let mimeType = mime.lookup(fileExt);
        
        this._params.Key = `${user.userid}/${fileData.fileName}` ;
        this._params.Body = data,this._params.ContentType = mimeType;
        return {
        upload: this._s3.upload(this._params).promise(),
        file: process.env.SERVER + `/${this._params.Key}`,
        id: newID,
        fileDateUpload: now
      }
    }
    async listOfUserUploads(userId) {
      let listOfFiles = [];
      let params = {
        Bucket: process.env.AWSS3_BUCKET,
        Prefix: `${userId}/`
      };
      let data = await this._s3.listObjects(params).promise();
      for (let i = 0; i < data.Contents.length; i++) {
        listOfFiles.push(data.Contents[i].Key);
      }
      return listOfFiles;
    }
    async deleteFile(userId, fileName) {
      let params = {
        Bucket: process.env.AWSS3_BUCKET,
        Key: `${userId}/${fileName}`
      };
      let data = await this._s3.deleteObject(params).promise();
      return data;
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