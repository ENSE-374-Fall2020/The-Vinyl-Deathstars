const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema(
    {
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        subject: String,

        date: Date,

        message: String
    });

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;