const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken.js");
const User = require("../models/user.model.js");

async function updateUserDetails(req, res) {
  try {
    const token = req.params.token || "";
    const user = await getUserDetailsFromToken(token);
    const { name, profile_pic } = req.body;


    const updateUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        name,
        profile_pic,
      },
      { new: true }
    );

    const userInfo = await User.findById(user._id);
   

    return res.json({
      message: "user updated successfully",
      data: userInfo,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = updateUserDetails;
