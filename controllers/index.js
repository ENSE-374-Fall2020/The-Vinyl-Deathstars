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
mongoose.set('useCreateIndex', true);
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
const Favourite = require("../models/favourite");




app.use(express.static('public'));
app.use(session({
    //secret: process.env.SECRET, // stores our secret in our .env file
    secret: "not so secret",
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
//how we process image from classified 
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


app.get('/account', async function (req, res) {
    if (req.isAuthenticated()) {

        var classifieds = await Classified.find({ user: req.user._id });
        var favourites = await Favourite.find({ user: req.user._id }).populate("classified");
        console.log(favourites);

        res.render('./pages/account.ejs', { user: req.user.username, classifieds: classifieds, favourites: favourites });
    }
    else {
        res.redirect('/');

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

            res.redirect('/account');
        }

    }
    else {
        // res.redirect('/');
        res.send("not working");
    }
});






app.get('/search', async function (req, res) {
    if (req.query.search) {
        if (req.query.searchCategory) {
            var classifieds = await Classified.find({ categorys: { $in: req.query.searchCategory }, $text: { $search: req.query.search } }).populate('user', 'username');

        } else {
            var classifieds = await Classified.find({ $text: { $search: req.query.search } }).populate('user', 'username');

        }

    }
    else {
        if (req.query.searchCategory) {
            var classifieds = await Classified.find({ categorys: { $in: req.query.searchCategory } }).populate('user', 'username');

        } else {
            var classifieds = await Classified.find().populate('user', 'username');

        }
    }
    if (req.isAuthenticated()) {


        res.render('./pages/search.ejs', { user: req.user.username, classifieds: classifieds });
    }
    else {
        res.render('./pages/search.ejs', { user: false, classifieds: classifieds });

    }
});




app.get('/classified', async function (req, res) {
    if (req.query) {
        var classified = await Classified.findById(req.query._id).populate('user');

    } else {
        res.redirect('/search');
    }
    if (req.isAuthenticated()) {
        var favourite = await Favourite.find({
            user: req.user._id,
            classified: req.query._id
        });
        var isFavourited = favourite.length > 0;
        console.log(isFavourited);

        res.render('./pages/classified.ejs', {
            user: req.user.username, classified: classified, displayFavourite: true,
            favourite: isFavourited
        });
    }
    else {
        res.render('./pages/classified.ejs', { user: false, classified: classified, displayFavourite: false });

    }
});

app.post("/deleteClassified", async function (req, res) {
    if (req.isAuthenticated()) {
        console.log(req.body._id);
        //find classified, then also delete associated favourites as well as classified
        var classified = await Classified.findOne({ _id: req.body._id });
        console.log(classified._id);
        await Favourite.deleteMany({ classified: classified._id });
        await Classified.deleteOne({ _id: req.body._id });
        res.redirect('back');
    }
    else {
        res.redirect('/');

    }
});


app.get('/inbox', async function (req, res) {
    if (req.isAuthenticated()) {

        if (Object.keys(req.query).length > 0) {
            var sortObj = req.query;
            var sort = Object.keys(sortObj)[0];
            var direction = Object.values(sortObj)[0];
            var mailbox = "";

        }
        else {
            //asc 1 desc -1
            var direction = 1;
            var sort = 'from';
        }

        var inbox = await Mail.find({ to: req.user._id, cleared: false }, { message: 0 }).populate('from', 'username');

        //sorts by date/from/subject 1 asc -1 desc
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


app.post('/deleteMail', async function (req, res) {
    if (req.isAuthenticated()) {
        if (!Array.isArray(req.body.selections)) {
            var deleteArr = [];
            deleteArr.push(req.body.selections);
        }
        else {
            var deleteArr = req.body.selections;
        }
        for (var entryIndex = 0; entryIndex < deleteArr.length; entryIndex++) {
            var update = await Mail.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(deleteArr[entryIndex]) },
                { cleared: true });

        }
        res.redirect('back');

    }
});




app.get('/compose', function (req, res) {
    if (req.isAuthenticated()) {

        if (req.query.sendTo) {
            console.log(req.query.sendTo);
            res.render('./pages/compose.ejs', { user: req.user.username, recipient: req.query.sendTo });

        } else {
            res.render('./pages/compose.ejs', { user: req.user.username, recipient: false });
        }



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
        message: req.body.message,
        cleared: false

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
            return res.status(409).send(info);
        }
        req.logIn(user, async function (err) {
            if (err) {

                return res.status(409).send(err);
            }
            return res.redirect('back');
        });
    })(req, res, next);

});




app.post('/register', function (req, res) {
    console.log(req.body);
    User.register({ username: req.body.username }, req.body.password, function (err, user, info) {
        if (err) {
            console.log(err + " THIS");
            res.status(409).send(err);
        } else {
            passport.authenticate("local")(req, res, function () {

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




app.post("/setFavourite", function (req, res) {

    if (req.isAuthenticated()) {
        if (req.body.c_id) {
            var c_id = req.body.c_id;
            console.log(c_id);
        }
        console.log(c_id);
        if (c_id) {
            const favourite = new Favourite({
                user: req.user._id,
                classified: c_id

            });

            favourite.save(function (err) {
                if (err) { console.log(err); }
                else { res.send({ message: favourite }); };
            });
        }


    }

});

app.post("/unsetFavourite", async function (req, res) {

    if (req.isAuthenticated()) {
        if (req.body.c_id) {
            var c_id = req.body.c_id;
            console.log(c_id);
        }
        console.log(c_id);
        if (c_id) {
            await Favourite.findOneAndDelete({
                user: req.user._id,
                classified: c_id
            });

            res.send({ message: "successful unfavourite" });


        }

    }
});



function mailsort(a, b, sort) {
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
}