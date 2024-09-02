const { uploadImageToCloudinary, uploadVideoToCloudinary, uploadAudioToCloudinary } = require("../helpers/cloudinaryConfig.js");

const uploadImage = async (req, res) => {
  try {
    const response = await uploadImageToCloudinary(req.file.buffer);
    res.status(201).json(response);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const response = await uploadVideoToCloudinary(req.file.buffer);
    res.status(201).json(response);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
};

const uploadAudio = async (req, res) => {
    try {
      const response = await  uploadAudioToCloudinary(req.file.buffer);
      res.status(201).json(response);
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  };



module.exports = { uploadImage, uploadVideo ,uploadAudio};
