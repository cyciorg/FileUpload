const path = require('path')
const dataDir = path.resolve(`${process.cwd()}${path.sep}src`);
const templateDir = path.resolve(`${dataDir}${path.sep}views`);
const renderTemplate = (req, res, template, data = {}) => {
    const baseData = {
      path: req.path
    };
    res.render(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data);
};

module.exports = renderTemplate;