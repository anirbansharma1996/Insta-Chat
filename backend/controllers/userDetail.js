const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken.js");

async function userDetails(req, res) {
  try {
    const token = req.params.token || "";
    const user = await getUserDetailsFromToken(token);
    if (!user) {
      return res.status(400).json({ message: "something went wrong" });
    }
    return res.status(200).json({
      message: "user details",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}
module.exports = userDetails;
