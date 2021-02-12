console.log(process.env.ENC_KEY);
var encryptor = require('simple-encryptor')(process.env.ENC_KEY); // cheeky :mm:
const enc = function handler(type, data) {
    if (!data) return null;
    if (type == 1) {
        let finished = encryptor.encrypt(data)
        if (finished == null) return data
        else return finished
    } else if (type == 2) {
        let finished = encryptor.decrypt(data)
        if (finished == null) return data
        else return finished
    } else {
        return "Failed to identify function"
    }
}
module.exports = enc;