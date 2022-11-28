const {  File } = require("fs/promises");
const globalConfig = {"format": "sxcu"}
class ShareXConfig {
    constructor(user) {
        this._user = user;
        this._config = {
            "Version": "13.7.0",
            "Name": "ShareXConfig-Cyci",
            "DestinationType": "ImageUploader, FileUploader",
            "RequestMethod": "POST",
            "RequestURL": `https://${process.env['API']}/api/v1/upload`,
            "Parameters": {
              "alpha": Date.now(),
              "version": require('../../package.json').version,
            },
            "Headers": {
              "x-user-email": this._user.email,
              "x-user-id": this._user.userid,
              "x-user-api-token": this._user.api_token
            },
            "Body": "MultipartFormData",
            "FileFormName": "cyciUploader",
            "URL": "$json:cyciUploader$",
            "ErrorMessage": "$json:error$"
          }
    }
    generateConfig = () => new Promise((resolve, reject) => {
       resolve({name: `ShareXConfig-Cyci-${this._user.userid}.${globalConfig.format}`, json: this._config});
    });
}

module.exports = {ShareXConfig: ShareXConfig};