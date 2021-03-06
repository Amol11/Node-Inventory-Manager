var mongoose = require('mongoose');


var Item = mongoose.model('Item', {
    //Strings will get typecasted
    itemName: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
    itemType: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
    itemOrderStatus:{
        type: Boolean,
        default: false,
    },
    itemOrderCreatedAt: {
        type: Number,
        default: null,
    },
    itemDeliveryStatus: {
        type: String,
        minlength: 2,
        trim: true,
        default: 'At the warehouse',
    }, 
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

module.exports = {Item};