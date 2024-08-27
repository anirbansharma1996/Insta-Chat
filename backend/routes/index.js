const express = require("express");
const registerUser = require("../controllers/registerUser.js");
const checkMail = require("../controllers/checkMail.js");
const checkPassword = require("../controllers/checkPassword.js");
const userDetails = require("../controllers/userDetail.js");
const logout = require("../controllers/logout.js");
const updateUserDetails = require("../controllers/updateUserDetails.js");
const searchUser = require("../controllers/searchUser.js");
const { GetOutPut } = require("../controllers/geminiReply.js");
//const validate = require("../middleware/validated.js");


const router = express.Router();

router.post("/register", registerUser);
router.post("/email", checkMail);
router.post("/password", checkPassword);
router.get("/user-details/:token", userDetails);
router.get("/logout", logout);
router.post("/update-user/:token", updateUserDetails);
router.post("/search-user", searchUser);
router.post("/prompt",GetOutPut);


module.exports = router;
