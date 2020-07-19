'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var retweetSchema = Schema({
    user: String,
    comentario: String,
    tweet: {
        id: { type: Schema.ObjectId, ref: 'user' },
        contenido: String,
        usuario: String,
    },
    likes: [],
    listaComentarios: [{
        usuario: String,
        comentario: String,
    }]
});

module.exports = mongoose.model('retweet', retweetSchema)