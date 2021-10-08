const Sauce = require('../models/Sauce');
const fs = require('fs');

// -- Permet de créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    // -- Création de la sauce
    const sauce = new Sauce({
        // -- Opérateur spread ... pour faire une copie de tous les éléments de req.body
        ...sauceObject, // -- Correspond à title: req.body.title, etc...
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    // -- Sauvegarde dans la base de données
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce enregistrée !'
        }))
        .catch(err => {
            //console.log(err);
            res.status(400).json({ err });
        });
};

// -- Modifier une sauce existante
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    Sauce.updateOne({_id: req.params.id}, {
        ...sauceObject, _id: req.body.id
    })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
        .catch(err => {
            //console.log(err);
            res.status(400).json({ err });
        });
};

// -- Supprimer une sauce existante
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // -- Récuperer le nom de l'image
            const filename = sauce.imageUrl.split('/images/')[1];
            // -- Fonction pour supprimer un fichier
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(err => {
                        //console.log(err);
                        res.status(400).json({ err });
                    });
            });
        })
        .catch(err => res.status(500).json({ err }));
};

// -- Récuperer une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // Condition _id doit être égale à l'id en paramètre de l'url (accessible grace aux :)
        .then(sauce => res.status(200).json(sauce))
        .catch(err => {
            //console.log(err);
            res.status(404).json({ err });
        });
};

// -- Récuperer toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(err => {
            //console.log(err);
            res.status(400).json({ err });
        });
};

exports.isLikedOrDisliked = (req, res, next) => {
    // -- On récupère la valeur du like dans la requête
    switch (req.body.like) {
        // -- Like
        case 1:
            // -- Selection de la bonne sauce en comparant les id
            Sauce.updateOne({ _id: req.params.id }, {
                // -- Mise à jour des valeurs usersLiked et likes dans la bdd
                $push: { usersLiked: req.body.userId }, // -- Ajout de l'userId au tableau
                $inc: { likes: +1 }, // -- Ajout du like
            })
                .then(() => res.status(200).json({ message: 'Like ajouté !' }))
                .catch(err => res.status(400).json({ err }));
        break;
        // -- Dislike
        case -1:
            // -- Selection de la bonne sauce en comparant les id
            Sauce.updateOne({ _id: req.params.id }, {
                // -- Mise à jour des valeurs usersDisliked et dislikes dans la bdd
                $push: { usersDisliked: req.body.userId }, // -- Ajout de l'userId au tableau
                $inc: { dislikes: +1 }, // -- Ajout du dislike
            })
                .then(() => { res.status(200).json({ message: 'Dislike ajouté !' }) })
                .catch(err => res.status(400).json({ err }));
        break;
        // -- Suppression du like ou dislike
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        // -- Selection de la bonne sauce en comparant les id
                        Sauce.updateOne({ _id: req.params.id }, {
                            // -- Mise à jour des valeurs usersLiked et likes dans la bdd
                            $pull: { usersLiked: req.body.userId }, // -- Suppression de l'userId dans le tableau
                            $inc: { likes: -1 }, // -- Suppression du like
                        })
                            .then(() => res.status(200).json({ message: 'Like supprimé !' }))
                            .catch(err => res.status(400).json({ err }));
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            // -- Mise à jour des valeurs usersDisliked et dislikes dans la bdd
                            $pull: { usersDisliked: req.body.userId }, // -- Suppression de l'userId dans le tableau
                            $inc: { dislikes: -1 }, // -- Suppression du dislike
                        })
                            .then(() => res.status(200).json({ message: 'Dislike supprimé !' }))
                            .catch(err => res.status(400).json({ err }))
                    }
                })
                .catch(err => res.status(404).json({ err }))
        break;
    }
}