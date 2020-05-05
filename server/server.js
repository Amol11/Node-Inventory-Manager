const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Item} = require('./models/item.js');
var {User} = require('./models/user.js');
var {authenticate} = require('./middleware/authenticate.js');

var app = express();
const port = process.env.PORT || 3000;

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


app.delete('/items/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid ID!');
    }

    Item.findByIdAndDelete(id).then((item) => {
        if(!item){
            return res.status(404).send('No item found.');
        }

        res.send({item});
    }).catch(err => {
        res.status(400).send();
    });
});

app.patch('/items/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['itemName', 'itemType', 'itemInventoryStatus', 'itemOrderStatus']);

    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid ID!');
    }

    if(_.isBoolean(body.itemInventoryStatus) && body.itemInventoryStatus && _.isBoolean(body.itemOrderStatus) && body.itemOrderStatus){
        body.itemOrderCreatedAt = new Date().getTime();
    }
    else{
        body.itemOrderStatus = false;
        body.itemOrderCreatedAt = null;
    }

    Item.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then((item) => {
        if(!item){
            return res.status(404).send('Item was not found');
        }
        res.send({item});
    }).catch(err => {
        res.status(400).send();
    });

});


//user sign-up
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        // console.log(token);
        res.header('x-auth', token).send(user);
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});