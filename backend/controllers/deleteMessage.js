const { Message, Conversation } = require('../models/conversation.model.js');

const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    // Find and delete the message
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove the deleted message from all conversations
    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteMessage;
