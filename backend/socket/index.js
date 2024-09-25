const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { Conversation, Message } = require("../models/conversation.model.js");
const getConversation = require("../helpers/getConversation");
const UserModel = require("../models/user.model.js");
const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const fetchOGData = require("../helpers/ogLink.js");

const app = express();

/***socket connection */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// Online users
const onlineUser = new Set();
const blockedUsers = new Set();
const blockedBy = new Set();

io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token;
  const user = await getUserDetailsFromToken(token);
  const block_users = user?.blockedUsers?.map((user) => user.toString());
  const blockedBy_users = user?.blockedBy?.map((user) => user.toString());

  // Create a room for the user
  socket.join(user?._id?.toString());
  onlineUser.add(user?._id?.toString());

  // Update the blockedUsers and blockedBy sets
  block_users?.forEach((userId) => blockedUsers.add(userId));
  blockedBy_users?.forEach((userId) => blockedBy.add(userId));

  io.emit("onlineUser", Array.from(onlineUser));
  socket.on(
    "message-page",
    async ({ userId, pageNumber = 1, pageSize = 2 }) => {
      const userDetails = await UserModel.findById(userId).select("-password");
      const payload = {
        _id: userDetails?._id,
        name: userDetails?.name,
        email: userDetails?.email,
        profile_pic: userDetails?.profile_pic,
        online: onlineUser.has(userId),
      };
      socket.emit("message-user", payload);
      // calculate the message to skip
      const skipMessage = (pageNumber - 1) * pageSize;
      // Get previous messages
      const getConversationMessage = await Conversation.findOne({
        $or: [
          { sender: user?._id, receiver: userId },
          { sender: userId, receiver: user?._id },
        ],
      })
        .populate({
          path: "messages",
          options: {
            skip: skipMessage,
            limit: pageSize,
          },
          populate: {
            path: "replyTo",
            model: "messages",
            options: { lean: true },
          },
        })
        .sort({ updatedAt: -1 });
      // If the conversation exists and is marked as deleted for the current user, hide previous messages
      if (getConversationMessage?.deletedFor?.includes(user?._id)) {
        socket.emit("message", []); //Do not send previous messages if the conversation is marked as deleted for this user,Send an empty array
      } else {
        socket.emit("message", getConversationMessage?.messages || []); // Send the messages if the conversation is not deleted for the user
      }
    }
  );

  // typing
  socket.on("typing", async (data) => {
    socket.broadcast.emit("display", data);
  });

  // New message
  // Store user rate-limiting data in memory
  const rateLimitMap = {};
  // Rate-limiting configuration
  const MAX_MESSAGES = 2; // Max 2 messages
  const TIME_FRAME = 1 * 1000; // 1 seconds
  //--------------------------
  socket.on("new message", async (data) => {
    const userId = data.sender;
    const { page = 1, limit = 20 } = data;
    if (!rateLimitMap[userId]) {
      rateLimitMap[userId] = {
        messageCount: 1,
        firstMessageTimestamp: Date.now(),
      };
    } else {
      const currentTime = Date.now();
      const timeDiff = currentTime - rateLimitMap[userId].firstMessageTimestamp;

      // Reset the rate limit counter if the time frame has passed
      if (timeDiff > TIME_FRAME) {
        rateLimitMap[userId] = {
          messageCount: 1,
          firstMessageTimestamp: currentTime,
        };
      } else {
        // Increment the message count within the time frame
        rateLimitMap[userId].messageCount += 1;
        // If message count exceeds the max allowed, block the message
        if (rateLimitMap[userId].messageCount > MAX_MESSAGES) {
          socket.emit(
            "message-blocked",
            "Rate limit exceeded. Please wait before sending more messages."
          );
          return;
        }
      }
    }
    const sender = await UserModel.findById(data.sender).select("-password");
    const receiver = await UserModel.findById(data.receiver).select(
      "-password"
    );

    // Check if the user is blocked
    if (
      sender.blockedUsers.includes(data.receiver) ||
      receiver.blockedUsers.includes(data.sender)
    ) {
      socket.emit("message-blocked", "You can't send a message");
      return;
    }

    // If not blocked, start or find conversation
    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await new Conversation({
        sender: data?.sender,
        receiver: data?.receiver,
      }).save();
    }

    // Remove 'deletedBy' entry for the user who is sending a new message
    conversation.deletedBy = conversation.deletedBy.filter(
      (entry) => entry.userId.toString() !== data.sender
    );
    await conversation.save();

    // Check if message contains a URL (for OpenGraph preview)
    let ogData = null;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urlMatch = data?.text?.match(urlPattern);

    if (urlMatch) {
      ogData = await fetchOGData(urlMatch[0]); // You must ensure fetchOGData works correctly
    }

    // Create a new message
    const message = new Message({
      originalText: data.text.trim(),
      text: data.text.trim(),
      reaction: data.reaction,
      media: {
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
      },
      replyTo: data.replyTo,
      msgByUserId: data.msgByUserId,
      rcvByUserId: data.rcvByUserId,
      ogData: ogData
        ? {
            title: ogData.ogTitle,
            description: ogData.ogDescription,
            image: ogData.ogImage[0]?.url,
            url: ogData.ogUrl,
          }
        : null,
    });

    const savedMessage = await message.save();
    await Conversation.updateOne(
      { _id: conversation?._id },
      { $push: { messages: savedMessage?._id } }
    );

    // Fetch updated conversation and filter messages by deleted timestamp
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    })
      .populate({
        path: "messages",
        populate: {
          path: "replyTo",
          model: "messages",
          options: {
            lean: true,
            sort: { createdAt: -1 }, // Sort by latest messages
            skip: (page - 1) * limit, // Skip messages based on the page
            limit: limit,
          },
        },
      })
      .sort({ updatedAt: -1 })
      .select("-password");

    // Filter messages if the conversation was deleted for either the sender or receiver
    const deletedForSender = conversation.deletedBy.find(
      (entry) => entry.userId.toString() === data.sender
    );
    const deletedForReceiver = conversation.deletedBy.find(
      (entry) => entry.userId.toString() === data.receiver
    );

    let filteredMessages = getConversationMessage?.messages || [];

    if (deletedForSender) {
      filteredMessages = filteredMessages.filter(
        (msg) => new Date(msg.createdAt) > new Date(deletedForSender.deletedAt)
      );
    }

    if (deletedForReceiver) {
      filteredMessages = filteredMessages.filter(
        (msg) =>
          new Date(msg.createdAt) > new Date(deletedForReceiver.deletedAt)
      );
    }

    // Send messages to both sender and receiver
    io.to(data?.sender).emit("message", filteredMessages);
    io.to(data?.receiver).emit("message", filteredMessages);

    // Update conversation list for both sender and receiver
    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
  });

  //message reaction
  socket.on("reactToMessage", async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return socket.emit("reactionError", { error: "Message not found" });
      }
      const messageReact = await Message.findByIdAndUpdate(
        messageId,
        { $set: { reaction: emoji } },
        { new: true }
      );
      if (messageReact) {
        const conversation = await Conversation.findOne({
          messages: messageId,
        }).populate("messages");

        io.to(messageReact.msgByUserId.toString()).emit(
          "message",
          conversation.messages
        );

        const otherUser =
          conversation.sender.toString() === messageReact.msgByUserId.toString()
            ? conversation.receiver
            : conversation.sender;

        io.to(otherUser.toString()).emit("message", conversation.messages);
        socket.emit("update-success", { messageId });
      }
    } catch (error) {
      socket.emit("reactionError", { error: "Server error" });
    }
  });

  // block/unblock users
  socket.on("block-user", async (blockedUserId) => {
    try {
      await UserModel.findByIdAndUpdate(user._id, {
        $addToSet: { blockedUsers: blockedUserId },
      });
      await UserModel.findByIdAndUpdate(blockedUserId, {
        $addToSet: { blockedBy: user._id },
      });
      io.to(blockedUserId).emit("block-success", {
        message: "user blocked successfully",
        blockedUserId: blockedUserId,
      });
      socket.emit("block-success", { message: "user blocked successfully" });
    } catch (error) {
      socket.emit("block-falied", error.message);
    }
  });

  socket.on("unblock-user", async (unblockUserId) => {
    try {
      await UserModel.findByIdAndUpdate(user._id, {
        $pull: { blockedUsers: unblockUserId },
      });
      await UserModel.findByIdAndUpdate(unblockUserId, {
        $pull: { blockedBy: user._id },
      });
      io.to(unblockUserId).emit("unblock-success", {
        message: "user unblocked successfully",
        unblockUserId: unblockUserId,
      });
      socket.emit("unblock-success", {
        message: "user unblocked successfully",
      });
    } catch (error) {
      socket.emit("unblock-failed", error.message);
    }
  });

  // Sidebar update
  socket.on("sidebar", async (currentUserId) => {
    const conversation = await getConversation(currentUserId);
    socket.emit("conversation", conversation);
  });

  // Mark messages as seen
  socket.on("seen", async (msgByUserId) => {
    let conversation = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];

    await Message.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } }
    );

    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByUserId).emit("conversation", conversationReceiver);
  });

  // Mark messages as delivered
  socket.on("delivered", async (msgByUserId) => {
    let conversation = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });
    const conversationMessageId = conversation?.messages || [];
    await Message.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { isDelivered: true } }
    );
    const conversationSender = await getConversation(user?._id?.toString());
    io.to(user?._id?.toString()).emit("conversation", conversationSender);
  });

  // Update message data
  socket.on("update-message", async (data) => {
    const { messageId, newText, newImageUrl } = data;

    // Check if message contains a URL
    let ogData = null;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urlMatch = newText?.match(urlPattern);

    if (urlMatch) {
      ogData = await fetchOGData(urlMatch[0]);
    }

    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          $set: {
            text: newText,
            imageUrl: newImageUrl,
            ogData: ogData
              ? {
                  title: ogData.ogTitle,
                  description: ogData.ogDescription,
                  image: ogData.ogImage[0]?.url,
                  url: ogData.ogUrl,
                }
              : null,
            isEdited: true,
          },
        },
        { new: true }
      );
      if (updatedMessage) {
        const conversation = await Conversation.findOne({
          messages: messageId,
        }).populate({
          path: "messages",
          populate: {
            path: "replyTo",
            model: "messages",
            options: { lean: true },
          },
        });
        io.to(updatedMessage.msgByUserId.toString()).emit(
          "message",
          conversation.messages
        );
        const otherUser =
          conversation.sender.toString() ===
          updatedMessage.msgByUserId.toString()
            ? conversation.receiver
            : conversation.sender;

        io.to(otherUser.toString()).emit("message", conversation.messages);
        socket.emit("update-success", { messageId });
      } else {
        socket.emit("update-failure", { error: "Message not found" });
      }
    } catch (error) {
      socket.emit("update-failure", { error: error.message });
    }
  });
  // delete message data
  socket.on("delete-message", async (data) => {
    const { messageId } = data;
    try {
      const deletedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          $set: {
            isDeleted: true,
          },
        },
        { new: true }
      );

      if (deletedMessage) {
        const conversation = await Conversation.findOne({
          messages: messageId,
        }).populate("messages");

        io.to(deletedMessage.msgByUserId.toString()).emit(
          "message",
          conversation.messages
        );

        const otherUser =
          conversation.sender.toString() ===
          deletedMessage.msgByUserId.toString()
            ? conversation.receiver
            : conversation.sender;

        io.to(otherUser.toString()).emit("message", conversation.messages);
        socket.emit("delete-success", { messageId });
      } else {
        socket.emit("delete-failure", { error: "Message not found" });
      }
    } catch (error) {
      socket.emit("delete-failure", { error: error.message });
    }
  });
  // delete message for a user
  socket.on("delete-user-messages", async ({ messageId, userId }) => {
    try {
      const deletedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { deletedFor: userId } },
        { new: true }
      );
      if (deletedMessage) {
        const conversation = await Conversation.findOne({
          messages: messageId,
        }).populate("messages");

        io.to(deletedMessage.msgByUserId.toString()).emit(
          "message",
          conversation.messages
        );

        const otherUser =
          conversation.sender.toString() ===
          deletedMessage.msgByUserId.toString()
            ? conversation.receiver
            : conversation.sender;

        io.to(otherUser.toString()).emit("message", conversation.messages);
        socket.emit("delete-success", { messageId });
      }
    } catch (error) {
      socket.emit("delete-messages-failure", { error: error.message });
    }
  });
  // Delete conversation
  socket.on("delete-conversation", async ({ conversationId, userId }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        const existingEntry = conversation.deletedBy.find(
          (entry) => entry.userId.toString() === userId
        );
        if (!existingEntry) {
          // If not already deleted, add the deletion time for this user
          conversation.deletedBy.push({ userId, deletedAt: new Date() });
          await conversation.save();
        }
        socket.emit("conversation-deleted", { conversationId, success: true });
      } else {
        socket.emit("conversation-deleted", {
          conversationId,
          success: false,
          message: "Conversation not found",
        });
      }
    } catch (error) {
      // console.log(error);
      socket.emit("conversation-deleted", {
        conversationId,
        success: false,
        message: "Error deleting conversation",
      });
    }
  });

  //------------ Video call signaling ---------------
  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUser.has(data.to);
    if (sendUserSocket) {
      const request = {
        to: data.to,
        from: data.from._id,
        roomId: data.roomId,
        callType: data.callType,
      };
      socket.to(data.to).emit("incoming-video-call", request);
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUser.has(data.from);
    if (sendUserSocket) {
      socket.to(data.from).emit("video-call-rejected", true);
    }
  });

  socket.on("accept-incoming-call", ({ to, id, roomId }) => {
    const sendUserSocket = onlineUser.has(id);
    const receiveUserSocket = onlineUser.has(to);
    if (sendUserSocket && receiveUserSocket) {
      socket.join(roomId);
      socket.to(to).emit("accept-call", { roomId });
      io.to(roomId).emit("room-joined", { roomId });
    }
  });
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  // Disconnect
  socket.on("disconnect", () => {
    onlineUser.delete(user?._id?.toString());
  });
});

module.exports = {
  app,
  server,
};
