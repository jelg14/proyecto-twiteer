'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    contenido: String,
    user: String
})

/*
    var TweetSchema = Schema({
    contenido: String,
    user: String,
    likes:{
        cantidad_de_likes: Number,
        usuarios_que_reaccionaron: []
    },
    listaComentarios: [{
        usuario: String
        comentario: String,
    }],
    user:{ type: Schema.ObjectId, ref: 'user'}

})
*/


module.exports = mongoose.model('tweet', TweetSchema)