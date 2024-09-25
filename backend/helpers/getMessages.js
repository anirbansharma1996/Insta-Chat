const { Conversation, Message } = require("../models/conversation.model.js"); // Adjust the path to your Message model
// Function to get messages from the database
const getMessagesFromDatabase = async (conversationId, page, limit) => {
  try {
    const skip = (page - 1) * limit; // Calculate the number of messages to skip based on the page
    // Find the conversation by ID
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "messages",
        model: "messages",
        options: {
          sort: { createdAt: -1 }, // Sort messages by creation date in descending order
          skip: skip,
          limit: limit,
        },
        populate: {
          path: "msgByUserId",
          select: "-password", // Exclude the password from the user document
        },
      })
      .lean();
      
    // Return messages from the conversation
    return conversation ? conversation.messages : [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error; 
  }
};

module.exports = getMessagesFromDatabase;
