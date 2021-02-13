var AWS = require('aws-sdk'); 
AWS.config.update({accessKeyId: process.env.AWSS3_ID,secretAccessKey: process.env.AWSS3_KEY});

s3 = new AWS.S3({apiVersion: new Date(Date.now())});



let params = {
    Bucket: process.env.AWSS3_BUCKET,
    Key: "",
    Body: 'someFile'
};

class AmazonCDN {
    constructor(file) {
        if (!file) return;
        const fileData = file.replace(/\W+/g, '-');
        this._params = params;
        this._params.Body = fileData;
    }
    upload(path) {
        this._params.Key = `${path}/${process.env.AWSS3_ENC_KEY}`
    }
}
module.exports = AmazonCDN;