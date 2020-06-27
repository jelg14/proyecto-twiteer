'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    contenido: String,
    user: String
})

module.exports = mongoose.model('tweet', TweetSchema)