const { Conversation } = require("../models/conversation.model.js");

// Get a specific conversation between two users with pagination
const getConvo = async (req, res) => {
  try {
    const { currentUserId, page = 1 } = req.query;
    const limit = 10; // Fixed limit of 10

    if (currentUserId) {
      const currentUserConversation = await Conversation.find({
        $or: [{ sender: currentUserId }, { receiver: currentUserId }],
      })
        .sort({ updatedAt: -1 }) // Sort by most recent first
        .skip((page - 1) * limit) // Skip records for pagination
        .limit(limit) // Limit the result to 10 conversations
        .populate("messages")
        .populate({ path: "sender", select: "-password" })
        .populate({ path: "receiver", select: "-password" });

      const conversation = currentUserConversation.map((conv) => {
        const countUnseenMsg = conv?.messages?.reduce((preve, curr) => {
          const msgByUserId = curr?.msgByUserId?.toString();

          if (msgByUserId !== currentUserId) {
            return preve + (curr?.seen ? 0 : 1);
          } else {
            return preve;
          }
        }, 0);

        return {
          _id: conv?._id,
          sender: conv?.sender,
          receiver: conv?.receiver,
          unseenMsg: countUnseenMsg,
          lastMsg: conv?.messages[conv?.messages?.length - 1],
          deletedFor: conv?.deletedBy,
        };
      });
      // Return the paginated conversation list
      res.status(200).json({
        page: Number(page),
        limit,
        conversation,
      });
    } else {
      return res.status(400).json({ error: "currentUserId is required" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getConvo };
