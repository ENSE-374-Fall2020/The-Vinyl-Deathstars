const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        classified: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classified'
        },
    });




const Favourite = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourite;