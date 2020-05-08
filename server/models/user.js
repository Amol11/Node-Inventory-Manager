var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

mongoose.set('useCreateIndex', true);

var UserSchema = new mongoose.Schema({
    //Strings will get typecasted
    email: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        }
    }],
    
    orders: {
        type: Array,
        default: null,
    }
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        // console.log(token);
        return token;
    });
};

UserSchema.methods.removeToken = function(token) {
    var user = this;

    return user.updateOne({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try{
        decoded = jwt.verify(token, 'abc123');
    }
    catch(err){
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth',
    });
};

UserSchema.statics.findByCredentials = function(email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if(!user){
           return Promise.reject('No user found.');
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    resolve(user);
                }
                else{
                    reject('Passwords don\'t match.');
                }
            });
        });
    });
};

UserSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    }
    else{
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};