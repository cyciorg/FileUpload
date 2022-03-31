const { models } = require('../db/connector.js');
let express = require('express');
let router = express.Router()
async function checkAuthPlusAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    const user = req.user;
    const admin = await models.User.findByEmailOrId({
      email: user.email,
      id: user.id
    });
    if (admin) {
      if (admin.roles.includes('3')) {
        next();
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  } else return false;
}
router.use(checkAuthPlusAdmin);
module.exports = router;