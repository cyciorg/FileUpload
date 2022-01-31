const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
var dayjs = require('dayjs')
var now = dayjs()

const UserAccount = new Schema({
  userid: Number,
  email: String,
  api_token: String,
  roles: [Number],
  data: [{name: String, value: String, size: String, type: String, created_at: Date}],
  account_type: String,
  date: Date
});

UserAccount.statics.findByEmailOrId = function findByEmailOrId(data, cb){
  if (!data) return cb(new Error('No data provided'));
  if (data.email) {
    this.findOne({email: data.email}, function(err, result){
      if (err) return cb(err);
      if (!result) return cb(null, false);
      return cb(null, result);
    });
  } else if (data.userid) {
    this.findOne({userid: data.userid}, function(err, result){  
      if (err) return cb(err);
      if (!result) return cb(null, false);
      return cb(null, result);
    });
  }
};

UserAccount.statics.findOrCreate = function findOrCreate(profile, cb){
  this.findOne({userid : profile.id},function(err,result){ 
      if(!result){
        var userObj = new UserAccount({
          userid: profile.id,
          email: profile.email,
          api_token: profile.refreshToken,
          roles: [],
          data: [],
          account_type: '',
          date: now
        })
        userObj.save(function(err, result){
          if (err) return cb(err);
          return cb(null, result);
        });
          // userObj.email = profile.email;
          // userObj.account_type = profile.premium_type;
          // userObj.userid = profile.id;
          // userObj.api_token = null;
          // userObj.roles = [];
          // userObj.data = [];
          // userObj.date = now;
          // userObj.save(cb);
      }else{
          cb(err,result);
      }
  });
};

var exportUser = mongoose.model('UserAccount', UserAccount);

module.exports = exportUser;