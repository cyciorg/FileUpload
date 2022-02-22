const { writeFile } = require("fs/promises");
const globalConfig = {"format": "sxcu"}
class ShareXConfig {
    constructor(user) {
        this._user = user;
        this._config = {
            "Version": "13.7.0",
            "Name": "ShareXConfig-Cyci",
            "DestinationType": "ImageUploader, FileUploader",
            "RequestMethod": "POST",
            "RequestURL": `http://${process.env['API']}/api/v1/upload`,
            "Parameters": {
              "alpha": Date.now(),
              "version": require('../../package.json').version,
            },
            "Headers": {
              "xuser-email": this._user.email,
              "xuser-id": this._user.userid,
              "xuser-api_token": this._user.api_token
            },
            "Body": "MultipartFormData",
            "FileFormName": "cyciUploader",
            "URL": "$json:cyciUploader$",
            "ErrorMessage": "$json:error$"
          }
    }
    generateConfig = () => new Promise((resolve, reject) => {
        writeFile(`ShareXConfig-Cyci-${this._user.userid}.${globalConfig.format}`, JSON.stringify(this._config, null, 2), 'utf8')
        .then(() => {
           resolve("Successfully created ShareXConfig-Cyci");
        })
        .catch(err => {
            reject(err);
        })
    });
}

module.exports = {ShareXConfig: ShareXConfig};