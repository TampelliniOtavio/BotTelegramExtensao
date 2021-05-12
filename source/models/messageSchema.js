const mongoose  = require("mongoose");

const messageSchema = mongoose.Schema({
    key: { type: String, required: true },
    value: { type: Array, required: true },
    buttons: { type: Array, required: true},
    previous: { type: String, required: true},
    level: { type: Number, required: true}
});



module.exports = mongoose.model("Message", messageSchema);