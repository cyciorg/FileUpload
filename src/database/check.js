const bcrypt = require('bcrypt');
const db = require('./mysql');
const {MailcowApiClient} = require('../utils/cyciApi');
const api = new MailcowApiClient(process.env.MAILCOW_API_BASEURL, process.env.MAILCOW_API_KEY);
const check = async function(user, userid, userToken) {
    if (!user || !userid || !userToken) return "No user or token provided";
    const checkUser = await api.getUser(user);
    if (checkUser[0].username == undefined) return "No user with the provided email exists";
    db.query(`SELECT * FROM userData WHERE user = ?`, [user], function(dberr, data) {
        const encryptedPassword = await bcrypt.compareSync(userToken, data[0].token);
        const images = [];
        if (encryptedPassword) {
            db.query(`SELECT * FROM userUpload WHERE ownerID = ?`, [userid], function(dberr, data) {
                data.forEach(gallery => {
                    images.push(gallery);
                });
                return images;
            });
        } else return false;
    })
    
}
module.exports = check;