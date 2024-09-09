
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file); 
  formData.append("upload_preset", "chat-app-file");
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error.message);
    }
    return responseData;
  } catch (error) {
    console.error("Upload failed:", error);
    return { error: { message: error.message } };
  }
};

export default uploadFile;
