const roles = require("../utils/roles");
const { connectDb, models } = require('../db/connector');

async function post(req, res) {
   if (!req.isAuthenticated()) return res.status(401).send('Unauthorized');
   if (!models.User.findOne({userid: req.params['userId']}, function(err, result){  
    if (err) cb(err);
    if (!result) cb(err, false)
   })) return res.status(404).send('User not found');
   if (req.user.roles[0] < roles.ADMIN) return res.status(401).send('Unauthorized');

   models.User.findOne({userid: req.params['userId']}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(err, false);
    models.User.appendRole(result, req.body.data.roleChoice, function(err, result){
        if (err) return cb(err);
        if (!result) return cb(err, false);
        return res.status(200).send(result);
    });
   });
   // hold off until rate limit and  upload is fully reworked
}

module.exports = {post};