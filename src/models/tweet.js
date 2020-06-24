'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    contenido: String,
    user: { type: Schema.ObjectId, ref: 'user' }
})

module.exports = mongoose.model('tweet', TweetSchema)