const express = require("express");
const registerUser = require("../controllers/registerUser.js");
const checkMail = require("../controllers/checkMail.js");
const checkPassword = require("../controllers/checkPassword.js");
const userDetails = require("../controllers/userDetail.js");
const logout = require("../controllers/logout.js");
const updateUserDetails = require("../controllers/updateUserDetails.js");
const searchUser = require("../controllers/searchUser.js");
const { GetOutPut } = require("../controllers/geminiReply.js");
const multer = require("multer");
const {
  uploadImage,
  uploadVideo,
  uploadAudio,
} = require("../controllers/uploadImage.js");
const urlEncoded = require("../controllers/ogLink.js");
const {
  getConvo,
  //getMessage,
} = require("../controllers/conversation.controller.js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register", registerUser);
router.post("/email", checkMail);
router.post("/password", checkPassword);
router.get("/user-details/:token", userDetails);
router.get("/logout", logout);
router.post("/update-user/:token", updateUserDetails);
router.post("/search-user", searchUser);
router.post("/prompt", GetOutPut);
router.post("/image-upload", upload.single("image"), uploadImage);
router.post("/video-upload", upload.single("video"), uploadVideo);
router.post("/audio-upload", upload.single("audio"), uploadAudio);
router.post("/fetch-og-data", urlEncoded), 
router.get("/conversation",getConvo);
//router.get("/messages/:userId", getMessage);

module.exports = router;
