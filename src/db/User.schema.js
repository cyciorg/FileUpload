const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
var dayjs = require('dayjs');
const roles = require('../utils/roles');
const crypto = require('crypto');
var now = dayjs()

const UserAccount = new Schema({
  userid: Number,
  email: String,
  api_token: String,
  roles: [Number],
  storage_used: Number,
  data: [{name: { type: String }, id: { type: String }, value: { type: String }, size: { type: String }, type: { type: String }, created_at: { type: Date }}],
  account_type: String,
  is_banned: Boolean,
  ban_reason: String,
  ban_expiry: Date,
  date: { type: Date, default: now },
});

UserAccount.statics.findByEmailOrId = async function findByEmailOrId(data, cb){
  if (!data) return Promise.reject('No data provided');
  if (data.email) {
    let account = await this.findOne({email: data.email}).then().catch(err => {return new Error(err)});
    if ((account instanceof Error)) Promise.reject(new Error('No account found')).catch(err => {return err});
    if (!account) Promise.reject(new Error('No account found')).catch(err => {return err});
    return Promise.resolve(account);
  } else if (data.userid) {
    let account = await this.findOne({userid: data.userid}).then();
    if ((account instanceof Error)) Promise.reject(new Error('No account found')).catch(err => {return err});
    if (!account) Promise.reject(new Error('No account found')).catch(err => {return err});
    return Promise.resolve(account);
  }
};

UserAccount.statics.checkApiToken = function checkApiToken(user, token, cb){
  if (!user) Promise.reject(new Error('No user provided')).catch(err => {return err});
  if (!token) Promise.reject(new Error('No token provided')).catch(err => {return err});
  if (user.api_token !== token) Promise.reject(new Error('Invalid token')).catch(err => {return err});
  return Promise.resolve(true);
};

UserAccount.statics.removeImageOrFile = function removeImageOrFile(user, data, cb){
  if (!user) return cb(new Error('No user provided'));
  if (!data) return cb(new Error('No data provided'));
  if (data.name) {
    this.findOne({userid: user.userid}, function(err, result){
      if (err) return cb(err);
      if (!result) return cb(null, false);
      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i].name == data.name) {
          result.data.splice(i, 1);
          result.save(function(err, result){
            if (err) return cb(err);
            return cb(null, result);
          });
        }
      }
    });
  } else if (data.id) {
    this.findOne({userid: user.userid}, function(err, result){
      if (err) return cb(err);
      if (!result) return cb(null, false);
      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i]._id == data.id) {
          result.data.splice(i, 1);
          result.save(function(err, result){
            if (err) return cb(err);
            return cb(null, result);
          });
        }
      }
    });
  }
};

UserAccount.statics.removeRole = function removeRole(user, role, cb){
  if (!user) return cb(new Error('No user provided'));
  if (!role) return cb(new Error('No role provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    for (let i = 0; i < result.roles.length; i++) {
      if (result.roles[i] == role) {
        result.roles.splice(i, 1);
        result.save(function(err, result){
          if (err) return cb(err);
          return cb(null, result);
        });
      }
    }
  });
};

UserAccount.statics.getUser = function getUser(user, cb){
  if (!user) return cb(new Error('No user provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    return cb(null, result);
  });
};

// Same as AppendRole, but for convenience its added as addRole
UserAccount.statics.addRole = function addRole(user, role, cb){
  if (!user) return cb(new Error('No user provided'));
  if (!role) return cb(new Error('No role provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    result.roles.push(role);
    result.save(function(err, result){
      if (err) return cb(err);
      return cb(null, result);
    });
  });
};


UserAccount.statics.appendRole = function appendRole(user, role, cb){
  if (!user) return cb(new Error('No user provided'));
  if (!role) return cb(new Error('No role provided'));
  //if (roles.USER || roles.PREMIUM || roles.MOD || roles.ADMIN || roles.OWNER !== role) return cb(new Error('Invalid role'));
  this.findOne({userid: user.userid}, function(err, result){  
    if (err) return cb(err);
    if (user.roles.includes(role)) return cb(new Error('User already has that role'));
    if (!result) return cb(null, false);
    user.roles.push(role);
    user.save(function(err, result){
      if (err) return cb(err);
      return cb(null, result);
    });
  });
};

UserAccount.statics.generateApiToken = async function generateApiToken(user){
  if (!user) return Promise.reject(new Error('No user provided'));
  user.api_token = crypto.randomBytes(32).toString('hex');
  user.save(function(err, result){
    if (err) return Promise.reject('No data provided');
    return Promise.resolve(result);
  });
};

UserAccount.statics.getImagesOrFiles = function getImagesOrFiles(user, cb){
  if (!user) return cb(new Error('No user provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    return cb(null, result.data);
  });
};


UserAccount.statics.getRoles = function getRoles(user, cb) {
  if (!user) return cb(new Error('No user provided'));
  if (user.email) {
    this.findOne({ email: user.email }, function (err, result) {
      if (err) return cb(err);
      if (!result) return cb(null, false);
      return cb(null, result.roles);
    });
  } else if (user.userid) {
    this.findOne({ userid: user.userid }, function (err, result) {
      if (err) return cb(err);
      if (!result) return cb(null, false);
      return cb(null, result.roles);
    });
  }
};
UserAccount.statics.purgeImagesOrFiles = function purgeImagesOrFiles(user, cb){
  if (!user) return cb(new Error('No user provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    result.data = [];
    result.save(function(err, result){
      if (err) return cb(err);
      return cb(null, result);
    });
  });
};
// Auto generated by CoPilot and modified by Phil K for use in the project
UserAccount.statics.addImageOrFile = function addImageOrFile(user, data, cb){
  if (!user) return cb(new Error('No user provided'));
  if (!data) return cb(new Error('No data provided'));
  if (!data.id) return cb(new Error('No userid provided'));
  if (!data.name) return cb(new Error('No name provided'));
  if (!data.value) return cb(new Error('No value provided'));
  if (!data.size) return cb(new Error('No size provided'));
  if (!data.type) return cb(new Error('No type provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    result.data.push({name: data.name, id: data.id, value: data.value, size: data.size, type: data.type, created_at: data.created_at});
    result.save(function(err, result){
      if (err) return cb(err);
      return cb(null, result);
    });
  });
};

UserAccount.statics.findOrCreate = function findOrCreate(profile, cb){
  this.findOne({userid : profile.id},function(err,result){ 
      if(!result){
        var userObj = new UserAccount({
          userid: profile.id,
          email: profile.email,
          api_token: '',
          roles: [0],
          data: [],
          account_type: '',
          date: now
        })
        userObj.save(function(err, result){
          if (err) return cb(err);
          return cb(null, result);
        });
      }else{
          cb(err,result);
      }
  });
};

var exportUser = mongoose.model('UserAccount', UserAccount);

module.exports = exportUser;