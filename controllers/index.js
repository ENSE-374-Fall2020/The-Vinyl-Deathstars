const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const port = 3000;

app.listen(port, function () {
    console.log(' server is running ' + port);
});

app.get('/createPost', function (req, res) {
    res.render('./pages/postbook');
});