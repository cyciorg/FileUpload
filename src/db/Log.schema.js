const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Log = new Schema({
    type: String,
    log: String,
    
    date: String,
});