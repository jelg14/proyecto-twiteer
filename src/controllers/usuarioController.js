'use strict'
var Usuario = require('../models/usuario');
var Tweet = require('../models/tweet');
var Retweet = require('../models/retweet')

function commands(req, res) {
    var c = req.body.commands;
    var array_de_c = c.split(' ');
    var entrada = array_de_c[0].toUpperCase()

    if (c == "") {
        return res.status(400).send({ message: "no puede ingresar un comando vacio" })
    } else if (entrada == "PORFILE" && array_de_c.length == 2) {
        var username = array_de_c[1];


        Usuario.find({ usuario: username }, (err, usuario) => {
            if (err) return res.status(500).send({ message: "error en la peticion" })
            if (!usuario) return res.status(404).send({ message: "no fue posible encontrar el perfil que solicita" })

            return res.status(200).send({ PerfilDelUsuario: usuario })
        })
    } else if (entrada == "FOLLOW" && array_de_c.length == 2) {
        var username = array_de_c[1];
        if (username == req.user.usuario) {
            return res.status(500).send("ERROR")
        }

        Usuario.updateMany({ usuario: username }, { $addToSet: { seguidores: req.user.usuario } }, { new: true }, (err, siguiendo) => {
            if (err) return res.status(500).send({ message: "Error en la peticion para seguir +" + err })
            if (!siguiendo) return res.status(404).send({ message: "Ocurrio un error en el transcurso de la peticion" })

            return res.status(200).send({ Siguiendo_a: siguiendo })
        })

    } else if (entrada == "UNFOLLOW" && array_de_c.length == 2) {
        var username = array_de_c[1];
        if (username == req.user.usuario) {
            return res.status(500).send("ERROR")
        }

        Usuario.update({ usuario: username }, { $pull: { seguidores: req.user.usuario } }, (err, siguiendo) => {
            if (err) return res.status(500).send({ message: "Error en la peticion para seguir +" + err })
            if (!siguiendo) return res.status(404).send({ message: "Ocurrio un error en el transcurso de la peticion" })
            return res.status(200).send({ Siguiendo_a: siguiendo })
        })

    } else if (entrada == "VIEW_TWEETS") {
        Tweet.find({ usuario: array_de_c[1] }, { usuario: 1, contenido: 1, cantidad_de_likes: 1, comentarios: 1, compartido: 1 }, (err, tweets) => {
            if (err) return res.status(500).send({ message: "error en la peticion de tweet =>" + err })
            if (!tweets) return res.status(500).send({ message: "error al listar los tweets=>" + req.user.sub })
            return res.status(200).send({
                Usuario: tweets
            })
        })
    } else if (entrada == "EDIT_TWEET" && array_de_c.length >= 3) {
        var idTweet = array_de_c[1]
        var primero = array_de_c.shift();
        var segundo = array_de_c.shift();
        var nuevo = array_de_c.join(' ');
        Tweet.findById(idTweet, (err, buscando) => {
            if (err) return res.status(500).send({ message: "Ocurrio un error durante el proceso" })
            if (!buscando) return res.status(404).send({ message: "No fue encontrado el tweet" })
            if (buscando.idUsuario == req.user.sub) {
                Tweet.findByIdAndUpdate(idTweet, { contenido: nuevo }, { new: true }, (err, tweetActualizado) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion: ' + err })
                    if (!tweetActualizado) return res.status(404).send({ message: 'No fue posible encontrar el tweet' })

                    return res.status(200).send({ tweetActualizado })
                })
            } else {
                console.log(buscando.idUsuario + " " + req.user.sub)
                return res.status(500).send({ message: "No tiene autorizacion para editar el tweet  " })

            }
        })

    } else if (entrada == "DELETE_TWEET") {
        var idTweet = array_de_c[1]

        Tweet.findById(idTweet, (err, tweetEliminado) => {
            if (err) return res.status(500).send({ message: "Error al realizar la peticion" })
            if (!tweetEliminado) return res.status(404).send({ message: 'No fue posible encontrar el tweet' })
            if (tweetEliminado.idUsuario == req.user.sub) {
                Tweet.findByIdAndDelete(idTweet, (err, eliminando) => {
                    if (err) return res.status(500).send({ message: "Error al realizar la peticion de eliminar" })
                    return res.status(200).send({ se_ha_eliminado_el_siguient_tweet: eliminando })
                })
            } else {
                return res.status(500).send({ message: "no tiene autorizacion para eliminar el tweet" })
            }

        })

    } else if (entrada == "ADD_TWEET") {
        var tweet = new Tweet();

        if (array_de_c.length) {
            var primero = array_de_c.shift()
            tweet.contenido = array_de_c.join(' '),
                tweet.usuario = req.user.usuario,
                tweet.idUsuario = req.user.sub,
                tweet.compartido = 0,
                tweet.cantidad_de_likes = 0,
                tweet.comentarios = 0,
                tweet.save((err, tweetCreado) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion de tweet =>' + err });
                    if (!tweetCreado) return res.status(404).send({ message: 'Error al agregar tweet' });
                    console.log(tweetCreado.contenido);
                    return res.status(200).send({ tweet: tweetCreado });
                })
        } else {
            return res.status(500).send({ message: "No puede agregar un tweet vacio" })
        }
    } else if (entrada == "LIKE_TWEET") {
        var idTweet = array_de_c[1];

        Tweet.findByIdAndUpdate(idTweet, { $addToSet: { likes: req.user.usuario }, $inc: { cantidad_de_likes: 1 } }, { new: true }, (err, like) => {
            if (err) return res.status(500).send({ message: "Error en la peticion de like" })
            if (!like) return res.status(404).send({ message: "El tweet no ha sido encontrado" })
            console.log(like.likes.length)

            return res.status(200).send({ like_a: like })
        })
    } else if (entrada == "DISLIKE_TWEET") {
        var idTweet = array_de_c[1];

        Tweet.findByIdAndUpdate(idTweet, { $pull: { likes: req.user.usuario }, $inc: { cantidad_de_likes: -1 } }, { new: true }, (err, like) => {
            if (err) return res.status(500).send({ message: "Error en la peticion de like" })
            if (!like) return res.status(404).send({ message: "El tweet no ha sido encontrado" })
            console.log(like.likes.length)
            return res.status(200).send({ like_a: like })
        })
    } else if (entrada == "REPLY_TWEET") {
        var idTweet = array_de_c[1];
        var primero = array_de_c.shift()
        var segundo = array_de_c.shift()
        var opinion = array_de_c.join(' ')

        if (array_de_c != 0) {
            Tweet.findByIdAndUpdate(idTweet, { $push: { listaComentarios: { usuario: req.user.usuario, comentario: opinion } }, $inc: { comentarios: 1 } }, { new: true }, (err, comentarioCreado) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' })
                if (!comentarioCreado) return res.status(404).send({ message: "El tweet ya no existe" })

                return res.status(200).send({ Comentario: comentarioCreado })
            })
        } else {
            return res.status(500).send({ message: "No puede ingresar un comentario vacio" })
        }

    } else if (entrada == "RETWEET") {
        var retweet = new Retweet();


        Tweet.findByIdAndUpdate(array_de_c[1], { $inc: { compartido: 1 } }, (err, tweetEncontrado) => {
            if (err) {
                return res.status(500).send({ message: "Error en la peticion" })
            } else if (!tweetEncontrado) {
                return res.status(404).send({ message: "El tweet no ha sido encontrado" })
            } else {
                retweet.user = req.user.usuario
                if (array_de_c[2]) {
                    var l = array_de_c.shift()
                    var j = array_de_c.shift()
                    var n = array_de_c.join(" ")
                    retweet.comentario = n
                }
                retweet.tweet = {
                    id: tweetEncontrado._id,
                    contenido: tweetEncontrado.contenido,
                    usuario: tweetEncontrado.usuario
                }
            }

            retweet.save((err, retweetCreado) => {
                if (err) return res.status(500).send({ message: "Error en la peticion" })
                if (retweetCreado) {
                    return res.status(200).send({ retweet: retweetCreado })
                } else { return res.status(404).send({ message: "no se ha podido crear el retweet" }) }
            })

        })

        Retweet.deleteMany({ "tweet.id": array_de_c[1] }, (err, t) => {
            if (err) console.log("ERROr")
            if (!t) console.log("Tweet no encontrado")
            Tweet.findByIdAndUpdate(array_de_c[1], { $inc: { compartido: -1 } })
            console.log(t)
        })
    } else {
        return res.status(400).send({ message: "Ha ingresado un comando de manera incorrecta, intentelo de nuevo " + array_de_c })
    }
}

module.exports = {
    commands
}