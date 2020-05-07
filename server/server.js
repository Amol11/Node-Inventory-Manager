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
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/website/signup.html');
});

app.post('/items', authenticate, (req, res) => {
    var item = new Item({
        itemName: req.body.itemName,
        itemType: req.body.itemType,
        _creator: req.user._id,
    });
    item.save().then((item) => {
        res.send(item);
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.get('/items', authenticate, (req, res) => {
    Item.find({
        _creator: req.user._id,
    }).then((items) => {
        res.send({items});
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.get('/items/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send('ID is invalid');
    }

    Item.findOne({
        _id: id,
        _creator: req.user._id,
    }).then((item) => {
        if(!item){
            return res.status(404).send('no item found');
        }

        res.send({item});
    }).catch(err => {
        res.status(400).send(err);
    });
});


app.delete('/items/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid ID!');
    }

    Item.findOneAndRemove({
        _id: id,
        _creator: req.user._id,
    }).then((item) => {
        if(!item){
            return res.status(404).send('No item found.');
        }

        res.send({item});
    }).catch(err => {
        res.status(400).send();
    });
});

app.patch('/items/:id', authenticate, (req, res) => {
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

    Item.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true})
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
        res.status(400).send(error);
    });
});

//user-info
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((err) => {
        res.status(400).send(err);
    });
});


//logout
app.delete('/users/me/token', authenticate, (req, res) => {
    // console.log(req.token);
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});