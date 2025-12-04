const Message = require('../models/Message')

exports.getMessages = async (req, res, next) => {
    try{
        const room = req.query.room || 'global'
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
  try {
    const { text, room } = req.body;

    const message = await Message.create({
      text,
      sender: req.user._id,
      senderName: req.user.name,
      room: room || "global",
    });

    const plainMessage = {
      _id: message._id,
      text: message.text,
      senderName: message.senderName,
      room: message.room,
      createdAt: message.createdAt
    };

    // Access io from global scope (set in server.js)
    global.io.emit("receiveMessage", plainMessage);

    res.status(201).json({
      success: true,
      data: plainMessage,
    });
  } catch (err) {
    next(err);
  }
};