//requires
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
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
const User = require("../models/user");
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
    res.render('./pages/postbook');
});

app.get('/search', function (req, res) {
    res.render('./pages/search');
});

app.get('/classified', function (req, res) {
    res.render('./pages/classified');
});

app.get('/inbox', function (req, res) {
    res.render('./pages/inbox');
});

app.get('/compose', function (req, res) {
    res.render('./pages/compose');
});

app.post('/compose', function (req, res) {
    var obj = {};
    console.log('body: ' + JSON.stringify(req.body.input));
    res.send(req.body);
});

app.post('/login', function (req, res, next) {

    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            console.log(info);
            return res.send({ error: "false" });
        }
        req.logIn(user, function (err) {
            if (err) {

                return next(err);
            }
            console.log('loginerror');
            return res.redirect('/');
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





