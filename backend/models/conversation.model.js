const { Schema, model, default: mongoose } = require("mongoose");

// Message Schema
const MessageSchema = new Schema(
  {
    originalText: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
      gen:"plain"
    },
    media: {
      imageUrl: {String},
      audioUrl: String,
      videoUrl: String,
      
    },
    reaction: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      required: false,
    },
    msgByUserId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    rcvByUserId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    ogData: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Conversation Schema
const ConversationSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "users",
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "messages",
      },
    ],
    deletedBy: [
      {
        userId: { type: mongoose.Schema.ObjectId, ref: "users" },
        deletedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Models
const Message = new model("messages", MessageSchema);
const Conversation = new model("conversations", ConversationSchema);

module.exports = { Message, Conversation };
