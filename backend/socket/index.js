const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { Conversation, Message } = require("../models/conversation.model.js");
const getConversation = require("../helpers/getConversation");
const UserModel = require("../models/user.model.js");
const { Server } = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();

/***socket connection */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
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
  const block_users = user.blockedUsers.map((user) => user.toString());
  const blockedBy_users = user.blockedBy.map((user) => user.toString());

  // Create a room for the user
  socket.join(user?._id?.toString());
  onlineUser.add(user?._id?.toString());

  // Update the blockedUsers and blockedBy sets
  block_users.forEach((userId) => blockedUsers.add(userId));
  blockedBy_users.forEach((userId) => blockedBy.add(userId));

  io.emit("onlineUser", Array.from(onlineUser));


  socket.on("message-page", async (userId) => {
    const userDetails = await UserModel.findById(userId).select("-password");
    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUser.has(userId),
    };
    socket.emit("message-user", payload);

    // Get previous messages
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate({
        path: "messages",
        populate: {
          path: "replyTo",
          model: "messages",
          options: { lean: true },
        },
      })
      .sort({ updatedAt: -1 });

    socket.emit("message", getConversationMessage?.messages || []);
  });

  // typing
  socket.on("typing", async (data) => {
    socket.broadcast.emit("display", data);
  });

  // New message
  socket.on("new message", async (data) => {
    const sender = await UserModel.findById(data.sender);
    const receiver = await UserModel.findById(data.receiver);

    // check if the user is blocke
    if (
      sender.blockedUsers.includes(data.reciver) ||
      receiver.blockedUsers.includes(data.sender)
    ) {
      socket.emit("message-blocked", "You cann't send message");
      return;
    }

    // if not blocked start chatting
    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });

    if (!conversation) {
      const createConversation = await Conversation({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    const message = new Message({
      text: data.text,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      replyTo: data.replyTo,
      msgByUserId: data?.msgByUserId,
      rcvByUserId: data?.rcvByUserId,
    });
    const saveMessage = await message.save();

    await Conversation.updateOne(
      { _id: conversation?._id },
      {
        $push: { messages: saveMessage?._id },
      }
    );

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
          options: { lean: true },
        },
      })
      .sort({ updatedAt: -1 });

    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );

    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
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
      io.to(blockedUserId).emit("block-success", {message : "user blocked successfully",blockedUserId:blockedUserId});
      socket.emit("block-success", {message : "user blocked successfully"});

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
      io.to(unblockUserId).emit("unblock-success", {message : "user unblocked successfully",unblockUserId:unblockUserId});
      socket.emit("unblock-success", {message : "user unblocked successfully"});
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
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          $set: {
            text: newText,
            imageUrl: newImageUrl,
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
  // Disconnect
  socket.on("disconnect", () => {
    onlineUser.delete(user?._id?.toString());
  });
});

module.exports = {
  app,
  server,
};
