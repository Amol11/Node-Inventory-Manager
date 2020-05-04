const mongoose = require('mongoose');

var User = mongoose.model('User', {
    //Strings will get typecasted
    name: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
    inventory: {
        type: Array,
        default: null,
    },
    orders: {
        type: Array,
        default: null,
    }
});

module.exports = {User};