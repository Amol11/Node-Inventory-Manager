const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

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

app.get('/items', (req, res) => {
    Item.find().then((items) => {
        res.send({items});
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.get('/items/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send('ID is invalid');
    }

    Item.findById(id).then((item) => {
        if(!item){
            return res.status(404).send('no item found');
        }

        res.send({item});
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});