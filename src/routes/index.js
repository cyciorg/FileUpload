const { models } = require('../db/connector.js');
const renderFile = require('../utils/renderFile.js');
const roles = require('../utils/roles.js');
async function get(req, res) {
    let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.realAddress || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    renderFile(req, res, 'index.ejs', {req: req, res: res, user: req.user});
    console.log(`${ip} - ${who}`);
    // if (!req.isAuthenticated()) return;
    // else
    // models.User.findOne({userid: req.user.id}, function(err, result){
    //     if (err) return console.log(err);
    //     if (!result) return console.log(err);
    //     req.user.mongoUser = result;
    //     console.log(req.user);
    // });
    // console.log(req.user.mongoUser);
};

async function post(req, res) {
};

module.exports = { post, get };