'use strict'
var Usuario = require('../models/usuario');
var Tweet = require('../models/tweet');

function commands(req, res) {
    var c = req.body.commands;
    var array_de_c = c.split(' ');
    var entrada = array_de_c[0].toUpperCase()

    if (c == "") {
        return res.status(400).send({ message: "no puede ingresar un comando vacio" })
    } else if (entrada == "PORFILE" && array_de_c.length == 2) {
        var username = array_de_c[1];


        Usuario.find(({ usuario: username }), (err, usuario) => {
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

    } else if (entrada == "VIEW_TWEETS" /*modificar */ ) {
        Tweet.find((err, tweets) => {
            if (err) return res.status(500).send({ message: "error en la peticion de tweet" })
            if (!tweets) return res.status(500).send({ message: "error al listar los tweets" })

            return res.status(200).send({ tweets: tweets })
        })
    } else if (entrada == "EDIT_TWEET" && array_de_c.length >= 3) {
        var idTweet = array_de_c[1]
        var primero = array_de_c.shift();
        var segundo = array_de_c.shift();
        var nuevo = array_de_c.join();

        Tweet.findByIdAndUpdate(idTweet, { contenido: nuevo }, { new: true }, (err, tweetActualizado) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion: ' + err })
            if (!tweetActualizado) return res.status(404).send({ message: 'No fue posible encontrar el tweet' })

            return res.status(200).send({ tweetActualizado })
        })

    } else if (entrada == "DELETE_TWEET" && array_de_c.length == 2) {
        var idTweet = array_de_c[1]
        Tweet.findByIdAndDelete(idTweet, (err, tweetEliminado) => {
            if (err) return res.status(500).send({ message: "Error al realizar la peticion de eliminar" })
            if (!tweetEliminado) return res.status(404).send({ message: 'No fue posible encontrar el tweet' })

            return res.status(200).send({ Se_ha_eliminado_el_siguiente_tweet_: tweetEliminado })
        })

    } else if (entrada == "ADD_TWEET") {
        var tweet = new Tweet();
        var user = new Usuario();
        var conteo = 0;
        var params = req.body;

        if (array_de_c.length) {
            var primero = array_de_c.shift()
            tweet.contenido = array_de_c.join(' '),
                tweet.usuario = req.user.usuario,
                tweet.save((err, tweetCreado) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion de tweet =>' + err });
                    if (!tweetCreado) return res.status(404).send({ message: 'Error al agregar tweet' });

                    return res.status(200).send({ tweet: tweetCreado });
                })
        } else {
            return res.status(500).send({ message: "No puede agregar un tweet vacio" })
        }
    } else if (entrada == "LIKE") {
        var idTweet = array_de_c[1];

        Tweet.findByIdAndUpdate(idTweet, { $addToSet: { likes: req.user.usuario } }, { new: true }, (err, like) => {
            if (err) return res.status(500).send({ message: "Error en la peticion de like" })
            if (!like) return res.status(404).send({ message: "El tweet no ha sido encontrado" })
            console.log(like.likes.length)
            return res.status(200).send({ like_a: like })
        })
    } else if (entrada == "DISLIKE") {
        var idTweet = array_de_c[1];

        Tweet.findByIdAndUpdate(idTweet, { $pull: { likes: req.user.usuario } }, { new: true }, (err, like) => {
            if (err) return res.status(500).send({ message: "Error en la peticion de like" })
            if (!like) return res.status(404).send({ message: "El tweet no ha sido encontrado" })
            console.log(like.likes.length)
            return res.status(200).send({ like_a: like })
        })
    } else if (entrada == "COMENTAR") {
        var idTweet = array_de_c[1];
        var primero = array_de_c.shift()
        var segundo = array_de_c.shift()
        var opinion = array_de_c.join(' ')

        if (array_de_c) {
            Tweet.findByIdAndUpdate(idTweet, { $push: { listaComentarios: { usuario: req.user.usuario, comentario: opinion } } }, { new: true }, (err, comentarioCreado) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' })
                if (!comentarioCreado) return res.status(404).send({ message: "El tweet ya no existe" })

                return res.status(200).send({ Comentario: comentarioCreado })
            })
        }

    } else if (entrada == "RETWEET") {

    } else {
        return res.status(400).send({ message: "Ha ingresado un comando de manera incorrecta, intentelo de nuevo " + array_de_c })
    }
}

module.exports = {
    commands
}