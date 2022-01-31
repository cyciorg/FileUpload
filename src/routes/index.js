const renderFile = require('../utils/renderFile.js');
async function get(req, res) {
    renderFile(req, res, 'index.ejs', {req: req, res: res, user: req.user});
};

async function post(req, res) {
};

module.exports = { post, get };