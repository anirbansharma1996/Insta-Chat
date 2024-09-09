const { Schema, model, default: mongoose } = require("mongoose");

const MessageSchema = new Schema(
  {
    originalText:{
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    audioUrl: {
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
  },
  { timestamps: true }
);

const ConvserSationSchema = new Schema(
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
  },
  { timestamps: true }
);

const Message = new model("messages", MessageSchema);
const Conversation = new model("conversation", ConvserSationSchema);

module.exports = { Message, Conversation };
