const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

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
