const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});

// Convert buffer to base64
const bufferToBase64 = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Provided data is not a Buffer");
  }
  return buffer.toString("base64");
};

// Upload image buffer to Cloudinary
const uploadImageToCloudinary = async (imageBuffer) => {
  try {
    const base64String = bufferToBase64(imageBuffer);
    const base64Image = `data:image/jpeg;base64,${base64String}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "uploads",
    });
    return result.secure_url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Upload Audio buffer to Cloudinary
const uploadAudioToCloudinary = async (audioBuffer) => {
  try {
    const base64String = bufferToBase64(audioBuffer);
    const base64Audio = `data:audio/mp3;base64,${base64String}`;
    const result = await cloudinary.uploader.upload(base64Audio, {
      resource_type: "raw",
    });
    return result.secure_url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
  // Upload Video buffer to Cloudinary
const uploadVideoToCloudinary = async (videoBuffer) => {
  try {
    const base64String = bufferToBase64(videoBuffer);
    const base64Audio = `data:video/mp4;base64,${base64String}`;
    const result = await cloudinary.uploader.upload(base64Audio, {
      resource_type: "video",
    });
    return result.secure_url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


module.exports = { uploadAudioToCloudinary, uploadVideoToCloudinary,uploadImageToCloudinary };
