const path = require('path')
const dataDir = path.resolve(`${process.cwd()}${path.sep}src`);
const templateDir = path.resolve(`${dataDir}${path.sep}views`);
const renderTemplate = (req, res, template, data = {}) => {
   
    res.render(`${templateDir}${path.sep}${template}`, data);
};

module.exports = renderTemplate;