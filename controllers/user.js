const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// -- Permet d'enregistrer un utilisateur avec une adresse mail unique et un mdp hashé
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            // -- Création d'un nouvel utilisateur
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // -- Sauvegarde de l'utilisateur en bdd
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(err => {
                    //console.log(err);
                    res.status(400).json({ err });
                });
        })
        .catch(err => {
            //console.log(err);
            res.status(500).json({ err });
        });
};

// -- Permet à un utilisateur de se connecter
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // L'email rentré doit correspondre à l'email de l'utilisateur
        .then(user => {
            // Si l'utilisateur n'existe pas
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // Compare le mot de passe rentré avec celui de l'utilisateur
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_RANDOM,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(err => {
                    //console.log(err);
                    res.status(500).json({ err });
                });
        })
        .catch(err => {
            //console.log(err);
            res.status(500).json({ err });
        });
};