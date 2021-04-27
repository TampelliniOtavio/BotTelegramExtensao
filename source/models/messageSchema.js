const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    key: {type: String, required: true},
    value: {type: Array, required: true}
});



module.exports = mongoose.model("Message", messageSchema)