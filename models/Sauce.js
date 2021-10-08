const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const sauceSchema = mongoose.Schema({
    // -- Identifiant de l'utilisateur
    userId: { type: String, required: true },
    // -- Nom de la sauce
    name: { type: String, required: true },
    // -- Fabricant de la sauce
    manufacturer: { type: String, required: true },
    // -- Déscription de la sauce
    description: { type: String, required: true },
    // -- Principal ingrédient
    mainPepper: { type: String, required: true },
    // -- Image de la sauce
    imageUrl: { type: String, required: true },
    // -- Nombre décrivant la sauce
    heat: { type: Number, required: true },
    // -- Nombre de likes
    likes: { type: Number, required: true },
    // -- Nombre de dislikes
    dislikes: { type: Number, required: true },
    // -- Utilisateur qui ont like la sauce
    usersLiked: { type: [String], required: true },
    // -- Utilisateur qui ont dislike la sauce
    usersDisliked: { type: [String], required: true },
});

sauceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Sauce', sauceSchema);