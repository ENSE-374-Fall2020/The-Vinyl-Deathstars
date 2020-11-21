const mongoose = require('mongoose');
const ppLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
    {
        username: String,
        password: String
    });
userSchema.plugin(ppLocalMongoose);



const User = mongoose.model('User', userSchema);

module.exports = User;