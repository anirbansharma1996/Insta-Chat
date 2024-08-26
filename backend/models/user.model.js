const { Schema, model, default: mongoose } = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "enter name"],
    },
    email: {
      type: String,
      required: [true, "enter email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "enter password"],
    },
    profile_pic: {
      type: String,
      default: "",
    },
    blockedUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
    ],
    blockedBy: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

const User = new model("users", UserSchema);
module.exports = User;
