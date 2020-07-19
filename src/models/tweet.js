'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    contenido: String,
    idUsuario: { type: Schema.ObjectId, ref: 'user' },
    usuario: String,
    likes: [],
    listaComentarios: [{
        usuario: String,
        comentario: String,
    }],
    compartido: Number,
    cantidad_de_likes: Number,
    comentarios: Number
})

module.exports = mongoose.model('tweet', TweetSchema)