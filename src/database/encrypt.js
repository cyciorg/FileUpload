const bcrypt = require('bcrypt');
const register = async function(token) {
    const password = token;
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds) 
    
}
module.exports = register;