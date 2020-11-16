const mongoose = require('mongoose');

const textbookSchema = new mongoose.Schema(
    {
        name: String,
        description: String,
        category: String,
        image: String
    });

const Textbook = mongoose.model('Textbook', textbookSchema);

module.exports = Textbook;