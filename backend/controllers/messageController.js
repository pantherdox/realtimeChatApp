const Message = require('../models/Message')

exports.getMessages = async (req, res, next) => {
    try{
        const room = req.query.room || global
        const limit = parseInt(req.query.limit) || 50

        const messages = await Message.find({room})
        .sort({createdAt: -1})
        .limit(limit)
        .populate('sender', 'name email')

        res.json({
            success: true,
            data: messages.reverse()
        })
    } catch(err){
        next(err)
    }
}

exports.postMessage = async (req, res, next) => {
    try{
        const { text, room } = req.body
        if(!text) return res.status(400).json({success: false, message: "Message text is required"})

        const message = await Message.create({
            text,
            sender: req.user._id,
            senderName: req.user.name,
            room: room || 'global'
        })

        res.status(201).json({
            success: true,
            data: message
        })
    }catch(err){
        next(err)
    }
}