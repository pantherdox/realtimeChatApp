const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String},
    createdAt: { type: Date, default: Date.now },
    room: { type: String, default: 'global' }
})

module.exports = mongoose.model('Message', messageSchema)