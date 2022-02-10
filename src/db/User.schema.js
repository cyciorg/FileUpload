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
  data: [{name: String, id: String, value: String, size: String, type: String, created_at: Date}],
  account_type: String,
  date: Date
});

UserAccount.statics.findByEmailOrId = async function findByEmailOrId(data, cb){
  if (!data) return cb(new Error('No data provided'));
  if (data.email) {
    let account = await this.findOne({email: data.email}).then();
    if (account.err) return new Promise((resolve, reject) => {reject(account.err)});
    if (!account) return new Promise((resolve, reject) => {reject(new Error('No account found'));});
    return new Promise((resolve, reject) => {resolve(account)});
  } else if (data.userid) {
    let account = await this.findOne({email: data.email}).then();
    if (account.err) return new Promise((resolve, reject) => {reject(account.err)}); 
    if (!account) return new Promise.reject(new Error('No account found'));
    return new Promise((resolve, reject) => {resolve(account)});
  }
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

UserAccount.statics.generateApiToken = function generateApiToken(user, cb){
  if (!user) return cb(new Error('No user provided'));
  user.api_token = crypto.randomBytes(32).toString('hex');
  user.save(function(err, result){
    if (err) return cb(err);
    return cb(null, result);
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

// Auto generated by CoPilot and modified by Phil K for use in the project
UserAccount.statics.addImageOrFile = function addImageOrFile(user, data, cb){
  if (!user) return cb(new Error('No user provided'));
  if (!data) return cb(new Error('No data provided'));
  if (!data.userid) return cb(new Error('No userid provided'));
  if (!data.name) return cb(new Error('No name provided'));
  if (!data.value) return cb(new Error('No value provided'));
  if (!data.size) return cb(new Error('No size provided'));
  if (!data.type) return cb(new Error('No type provided'));
  this.findOne({userid: user.userid}, function(err, result){
    if (err) return cb(err);
    if (!result) return cb(null, false);
    result.data.push({name: data.name, value: data.value, size: data.size, type: data.type, created_at: now});
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