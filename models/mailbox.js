const mongoose = require('mongoose');
const Mail = require("./mail");

const mailboxSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        mail: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mail'
        }]

    });

const Mailbox = mongoose.model('Mailbox', mailboxSchema);

module.exports = Mailbox;