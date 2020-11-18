const express = require("express");
const app = express();
bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
const port = 3000;

app.listen(port, function () {
    console.log(' server is running ' + port);
});

app.get('/', function (req, res) {
    res.render('./pages/home.ejs');
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


