'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var retweetSchema = Schema({
    user: String,
    comentario: String,
    tweet: []
});

module.exports = mongoose.model('retweet', retweetSchema)