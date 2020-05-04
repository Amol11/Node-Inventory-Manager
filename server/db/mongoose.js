const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/InventoryManager',{
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => {
    console.log('DB Connected.');
}).catch(err => {
    console.log('DB error: ', err);
});

module.exports = {mongoose};