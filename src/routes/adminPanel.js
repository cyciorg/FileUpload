const { models } = require('../db/connector.js');
const renderFile = require('../utils/renderFile.js');
const roles = require('../utils/roles.js');

const idToRole = require('../utils/IdToRole.js');
async function get(req, res) {
    //let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.realAddress || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    if (!req.isAuthenticated()) renderFile(req, res, 'index.ejs', {req: req, res: res, user: undefined, isAuthenticated: false});
    else {
        let user = await models.User.findByEmailOrId({email: req.user.email, id: req.user.id});
        var roles = idToRole(user.roles[0]);
        renderFile(req, res, 'index.ejs', {req: req, res: res, user: req.user, role: roles, mongoData: user, isAuthenticated: true});
    }
};

async function post(req, res) {
};

module.exports = { post, get };