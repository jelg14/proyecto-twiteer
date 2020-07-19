'use strict'
var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var viewTweetSchema = Schema({
    contenido: String,
    usuario: String,
    likes: Number,
    Comentarios: Number,
    compartido: Number
})

module.exports = mongoose.model('viewTweet', viewTweetSchema)