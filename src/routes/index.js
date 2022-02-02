const { models } = require('../db/connector.js');
const renderFile = require('../utils/renderFile.js');
const roles = require('../utils/roles.js');
async function get(req, res) {
    renderFile(req, res, 'index.ejs', {req: req, res: res, user: req.user});
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