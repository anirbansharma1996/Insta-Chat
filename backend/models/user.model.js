const { Schema, model } = require("mongoose");

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
  },
  { timestamps: true }
);

const User = new model("users", UserSchema);
module.exports = User;
