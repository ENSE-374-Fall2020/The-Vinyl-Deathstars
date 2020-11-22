//requires
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const http = require("http");
const multer = require("multer");

bodyParser = require('body-parser');
mongoose.connect("mongodb://localhost:27017/bookDB",
    {
        useNewUrlParser: true, // these avoid MongoDB deprecation warnings
        useUnifiedTopology: true
    });
const passport = require("passport");
//set up passport for user
const ppLocalMongoose = require("passport-local-mongoose");
//require("dotenv").config();
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

//Model Requires
const User = require("../models/user");
const Mail = require("../models/mail");
const Classified = require("../models/classified");




app.use(express.static('public'));
app.use(session({
    //secret: process.env.SECRET, // stores our secret in our .env file
    secret: "not so secret", //Used for in lab only
    resave: false,              // other config settings explained in the docs
    saveUninitialized: false,
    cookie: { path: '/', httpOnly: true, maxAge: 36000000 }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const port = 3000;

//set storage for pictures
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/pictures');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            req.fileError = "Not a picture";
            return callback(null, false, req.fileError);
        }
        callback(null, true);
    },
});





app.listen(port, function () {
    console.log(' server is running ' + port);
});

app.get('/', function (req, res) {
    if (req.isAuthenticated()) {

        res.render('./pages/home.ejs', { user: req.user.username });
    }
    else {
        res.render('./pages/home.ejs', { user: false });

    }
});

app.get('/createPost', function (req, res) {
    if (req.isAuthenticated()) {

        res.render('./pages/postbook.ejs', { user: req.user.username });
    }
    else {
        res.redirect('/');

    }
});



app.post('/createPost', upload.single('myFile'), function (req, res) {
    if (req.isAuthenticated()) {

        if (req.fileError) { //checks to see if not right file type, if not, add file to server

            res.send(req.fileError);
        }
        else {

            console.log(req.body);
            console.log(req.file);

            const classified = new Classified(
                {
                    user: req.user._id,
                    name: req.body.inputTitle,
                    description: req.body.inputDescription,
                    categorys: req.body.inputCategory,
                    postType: req.body.buyOrSell,
                    image: "/pictures/" + req.file.filename,
                    price: req.body.inputPrice

                });

            classified.save(function (err) {
                if (err) console.log(err);
            });

            console.log(classified);
            res.redirect('/');
        }

    }
    else {
        res.redirect('/');

    }
});






app.get('/search', async function (req, res) {
    if (Object.keys(req.query).length > 0) {

    }
    else {
        var classifieds = await Classified.find().populate('user', 'username');
    }

    if (req.isAuthenticated()) {


        res.render('./pages/search.ejs', { user: req.user.username, classifieds: classifieds });
    }
    else {
        res.render('./pages/search.ejs', { user: false, classifieds: classifieds });

    }
});




app.get('/classified', function (req, res) {
    if (req.isAuthenticated()) {

        res.render('./pages/classified.ejs', { user: req.user.username });
    }
    else {
        res.render('./pages/classified.ejs', { user: false });

    }
});




app.get('/inbox', async function (req, res) {
    if (req.isAuthenticated()) {

        if (Object.keys(req.query).length > 0) {
            var sortObj = req.query;
            var sort = Object.keys(sortObj)[0];
            var direction = Object.values(sortObj)[0];

        }
        else {
            //asc 1 desc -1
            var direction = 1;
            var sort = 'from';
        }

        var inbox = await Mail.find({ to: req.user._id }, { message: 0 }).populate('from', 'username');

        inbox.sort(function (a, b) {
            if (sort == 'date') {
                var date1 = new Date(a.date);
                var date2 = new Date(b.date);

                return (date1 > date2) ? direction : direction * -1;

            }
            if (sort == 'from') {
                var user1 = a.from;
                var user2 = b.from;

                return (user1.username.localeCompare(user2.username)) * direction;

            }
            if (sort == 'subject') {
                var user1 = a;
                var user2 = b;

                return (user1.subject.localeCompare(user2.subject)) * direction;

            }
        });


        res.render('./pages/inbox.ejs', { user: req.user.username, inbox: inbox, sort: sort, direction: direction });
    }
    else {
        res.redirect('/');
    }
});




app.get('/viewMail', async function (req, res) {
    if (req.isAuthenticated()) {
        if (req.query) {
            var mail = req.query.mail;
        }
        console.log(mail);
        if (mail) {
            var message = await Mail.findOne({ _id: mail }, { message: 1, _id: 0 });
            message = message.message; //gets rid of of single field json
        }

        res.send({ message: message });
    }

});





app.get('/compose', function (req, res) {
    if (req.isAuthenticated()) {

        res.render('./pages/compose.ejs', { user: req.user.username });
    }
    else {
        res.redirect('/');

    }
});





app.post('/compose', async function (req, res) {
    var toUser = await User.findOne({ username: req.body.to }, function (err) {
        if (err) return res.status(400).send({ message: "error" });
    });
    console.log(toUser);
    console.log(req.body);

    //check validity of mail
    if (!toUser || toUser.username == "") {
        return res.status(422).send({ message: "Recipient does not exist" });
    }

    if (req.user._id.equals(toUser._id)) {
        return res.status(422).send({ message: "You can't send mail to yourself!" });
    }


    if (req.body.subject == "") {
        return res.status(422).send({ message: "Subject Must not be empty" });
    }


    const mail = new Mail({
        to: toUser._id,
        from: req.user._id,
        subject: req.body.subject,
        date: new Date().toLocaleString("en-US", { timeZone: "America/Regina" }),
        message: req.body.message

    });

    mail.save(function (err) {
        if (err) console.log(err);
    });


    res.send("All good"); //message saved and redirect back to inbox

});




app.post('/login', function (req, res, next) {

    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            console.log(info);
            return res.send({ error: "false" });
        }
        req.logIn(user, async function (err) {
            if (err) {

                return next(err);
            }
            return res.redirect('back');
        });
    })(req, res, next);

});




app.post('/register', function (req, res) {
    console.log(req.body.username);
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err + " THIS");
            res.redirect('/');
        } else {
            // authenticate using passport-local
            // what is this double function syntax?! It's called currying.
            passport.authenticate("local")(req, res, function () {

                //req.session.username = req.body.username;
                console.log("success");
                res.redirect('/');

            });
        }
    });
});

app.get("/logout", function (req, res) {
    console.log("A user logged out");
    req.logout();
    res.redirect("back");
});





