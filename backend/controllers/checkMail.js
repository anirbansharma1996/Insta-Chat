const User = require("../models/user.model");

async function checkMail(req, res) {
  try {
    const { email } = req.body;
    const checkEmail = await User.findOne({ email }).select("-password");

    if (!checkEmail) {
      return res.status(400).json({
        message: "user doesn't exists",
        error: true,
      });
    }
    return res.status(200).json({
        message : 'email verified',
        success : true, 
        data : checkEmail
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}


module.exports = checkMail
