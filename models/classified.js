const mongoose = require('mongoose');

const classifiedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        description: String,
        categorys: [String],
        image: String,
        price: Number,
        postType: {
            type: String,
            enum: ['buying', 'selling'],
            default: 'buying'
        },

    });

classifiedSchema.index({ description: 'text', name: 'text' });

const Classified = mongoose.model('Classified', classifiedSchema);

module.exports = Classified;