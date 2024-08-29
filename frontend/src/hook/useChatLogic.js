import { useState, useEffect,useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { REACT_APP_BACKEND_URL } from "../../env";
import toast from "react-hot-toast";
import axios from "axios";
import uploadFile from "../helpers/uploadFile";

const inititalState = {
  name: "",
  email: "",
  profile_pic: "",
  online: false,
  _id: "",
}
const messageState = {
  text: "",
  imageUrl: "",
}

const useChatLogic = () => {
  const params = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);
  const [dataUser, setDataUser] = useState(inititalState);
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState(messageState);
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const currentMessage = useRef(null);
  const [blockModal, setBlockModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // open camera modal
  const handleOpenCamera = () => {
    setIsModalOpen(true);
  };

  // close camera modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  //blobToFile convertion
  function blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type });
  }

  //base64ToBlob convertion
  function base64ToBlob(base64, mime) {
    const byteChars = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteChars.length; offset += 512) {
      const slice = byteChars.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mime });
  }

  // base64 to Blob file convert
  const handleCapturePhoto = async (imageData) => {
    const base64String = imageData;
    const mimeType = "image/jpeg";
    const filename = Date.now() + "_" + user.name + "-self.jpg";
    const base64Data = base64String.split(",")[1];
    const blob = base64ToBlob(base64Data, mimeType);
    const file = blobToFile(blob, filename);
    setCapturedImage(URL.createObjectURL(file));
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setMessage((preve) => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url,
      };
    });
    handleCloseModal();
    setOpenImageVideoUpload(false);
  };

  // scroll into view text
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  // open upload image / video
  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((preve) => !preve);
  };

  // open edit / delete / reply message modal
  const handleEditDeleteMessage = (el) => {
    setActiveMessageId((prevId) => (prevId === el._id ? null : el._id));
  };

  // uploading image / video
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((preve) => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url,
      };
    });
  };

  // clear upload image field
  const handleClearUploadImage = () => {
    setMessage((preve) => {
      return {
        ...preve,
        imageUrl: "",
      };
    });
  };

  const handleClearUploadAudio = () => {
    setAudioUrl(false);
  };

  // on mounting this socket connection function will run
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("delivered", params.userId);
      socketConnection.emit("message-page", params.userId);
      socketConnection.emit("seen", params.userId);
      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });
      socketConnection.on("message", (data) => {
        setAllMessage(data);
      });
      socketConnection.on("display", (data) => {
        setIsTyping(data.typing ? true : false);
      });
      socketConnection.on("block-success", ({ message }) => {
        if (message) window.location.reload();
      });
      socketConnection.on("unblock-success", ({ message }) => {
        if (message) window.location.reload();
      });
    }
  }, [socketConnection, params?.userId, user]);

  // input taking
  const handleOnChange = (e) => {
    const { value } = e.target;
    socketConnection.emit("typing", { typing: true });
    setMessage((preve) => {
      return {
        ...preve,
        text: value,
      };
    });
    if (value) {
      setTimeout(() => {
        socketConnection.emit("typing", { typing: false });
      }, 3000);
    }
  };

  // sending message / updating message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.audio) {
      if (socketConnection) {
        if (editingMessageId) {
          socketConnection.emit("update-message", {
            messageId: editingMessageId,
            newText: message.text,
          });
          setEditingMessageId(null);
        } else {
          socketConnection.emit("new message", {
            sender: user?._id,
            receiver: params.userId,
            text: message.text,
            imageUrl: message.imageUrl,
            audioUrl: message.audio,
            msgByUserId: user?._id,
            rcvByUserId: params.userId,
            replyTo: replyingMessage?._id,
          });
        }
        socketConnection.emit("typing", { typing: false });
        setReplyingMessage(null);
        setAudioUrl(false);
        setMessage({
          text: "",
          imageUrl: "",
        });
      }
    }
  };

  // editing text function fire
  const handleEditText = (el) => {
    setMessage({
      text: el.text,
      imageUrl: el.imageUrl || "",
    });
    setEditingMessageId(el._id);
  };

  // delete a single text
  const handleDeleteText = async (id) => {
    socketConnection.emit("delete-message", {
      messageId: id,
    });
    setEditingMessageId(null);
  };
  // reply to a text
  const handleReply = (message) => {
    setReplyingMessage(message);
  };

  // voice record start
  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const audioBlob = event.data;
            setLoading(true);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audiodata = await uploadFile(audioBlob);
            setMessage({ ...message, audio: audiodata.url });
            setLoading(false);
            setAudioUrl(audioUrl);
          }
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        alert("Error accessing audio devices");
      }
    } else {
      alert("Audio recording is not supported in this browser.");
    }
  };
  // voice record stop
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // open block / unblock user modal
  const handleBlockUnblockUser = () => {
    setBlockModal(!blockModal);
  };
  // block and unblock user
  const handleBlockFn = (B_id) => {
    if (socketConnection) {
      socketConnection.emit("block-user", B_id);
    }
    setBlockModal(!blockModal);
  };

  const handleUnblockFn = (u_id) => {
    if (socketConnection) {
      socketConnection.emit("unblock-user", u_id);
    }
    setBlockModal(!blockModal);
  };

  // reply with AI
  const handleAiReply = async (query) => {
    try {
      setAiLoading(true);
      const res = await axios.post(`${REACT_APP_BACKEND_URL}/prompt`, {
        prompt: query,
      });
  
      if (res.status == 200) {
        setMessage((preve) => {
          return {
            ...preve,
            text: res.data.answer.replace(/\n/g, ""),
          };
        });
        setAiLoading(false);
      }
    } catch (error) {
      setAiLoading(false);
      toast.error("AI currently unavailable");
    }
  };

  return {
    user,
    dataUser,
    allMessage,
    message,
    isTyping,
    audioUrl,
    blockModal,
    isModalOpen,
    replyingMessage,
    editingMessageId,
    currentMessage,
    handleDeleteText,
    loading,
    aiLoading,
    openImageVideoUpload,
    isRecording,
    handleOnChange,
    handleSendMessage,
    handleUploadImageVideoOpen,
    handleUploadImage,
    handleClearUploadImage,
    handleClearUploadAudio,
    handleOpenCamera,
    startRecording,
    stopRecording,
    handleBlockFn,
    handleEditText,
    handleUnblockFn,
    handleBlockUnblockUser,
    handleCloseModal,
    handleCapturePhoto,
    handleReply,
    handleEditDeleteMessage,
    handleAiReply,
    activeMessageId ,
    setReplyingMessage 
  };
};

export default useChatLogic;
