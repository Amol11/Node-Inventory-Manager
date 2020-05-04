const express = require('express');
const bodyParser = require('body-parser');


var {mongoose} = require('./db/mongoose.js');
var {Item} = require('./models/item.js');
var {User} = require('./models/user.js');

var app = express();

app.use(bodyParser.json());

app.post('/items', (req, res) => {
    var item = new Item({
        itemName: req.body.itemName,
        itemType: req.body.itemType
    });
    item.save().then((item) => {
        res.send(item);
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});