import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import uploadFile from "../helpers/uploadFile";
import { IoClose } from "react-icons/io5";
import Loading from "./Loading";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import { MdDone } from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";
import { MdModeEditOutline, MdDeleteOutline } from "react-icons/md";
import { REACT_APP_BACKEND_URL } from "../../env";
import { RxCross2 } from "react-icons/rx";

const MessagePage = () => {
  const tk = localStorage.getItem("token");
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  //const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const currentMessage = useRef(null);

  const handleOpenCamera = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  //blobToFile
  function blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type });
  }
  //base64ToBlob
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

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((preve) => !preve);
  };
  const handleEditDeleteMessage = (el) => {
    if (el.msgByUserId === user._id) {
      setActiveMessageId((prevId) => (prevId === el._id ? null : el._id));
    }
  };

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
  const handleClearUploadImage = () => {
    setMessage((preve) => {
      return {
        ...preve,
        imageUrl: "",
      };
    });
  };

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
    }
  }, [socketConnection, params?.userId, user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setMessage((preve) => {
      return {
        ...preve,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl) {
      if (socketConnection) {
        if (editingMessageId) {
          socketConnection.emit("update-message", {
            messageId: editingMessageId,
            newText: message.text,
            newImageUrl: message.imageUrl,
          });
          setEditingMessageId(null);
        } else {
          socketConnection.emit("new message", {
            sender: user?._id,
            receiver: params.userId,
            text: message.text,
            imageUrl: message.imageUrl,
            msgByUserId: user?._id,
            rcvByUserId: params.userId,
          });
        }
        setMessage({
          text: "",
          imageUrl: "",
        });
      }
    }
  };

  const handleEditText = (el) => {
    setMessage({
      text: el.text,
      imageUrl: el.imageUrl || "",
    });
    setEditingMessageId(el._id);
  };

  const handleDeleteText = async (id) => {
    socketConnection.emit("delete-message", {
      messageId: id,
    });
    setEditingMessageId(null);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${"https://wallpapercave.com/wp/wp9875549.jpg"})`,
      }}
      className="bg-no-repeat bg-cover"
    >
      <header className="sticky top-0 h-16 bg-white flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {dataUser?.name}
            </h3>
            <p className="-my-2 text-sm">
              {dataUser.online ? (
                <span className="text-primary">online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <button className="cursor-pointer hover:text-primary">
            <HiDotsVertical />
          </button>
        </div>
      </header>

      {/***show all message */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        <div className="flex flex-col gap-2 py-2 mx-2 " ref={currentMessage}>
          {allMessage.map((msg) => {
            return (
              <div
                key={msg._id}
                onClick={() => handleEditDeleteMessage(msg)}
                className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
                  user._id === msg?.msgByUserId
                    ? "ml-auto bg-teal-100"
                    : "bg-white"
                } cursor-pointer`}
              >
                <div className="w-full relative">
                  {msg?.imageUrl && (
                    <img
                      src={!msg?.isDeleted && msg?.imageUrl}
                      className="w-full h-full object-scale-down"
                    />
                  )}
                </div>
                {msg?.isDeleted ? (
                  <p className="px-2 text-gray-400">
                    {"this message hasbeen deleted..."}
                  </p>
                ) : (
                  <p className="px-2">{msg.text}</p>
                )}
                {!msg?.isDeleted ? (
                  <div className="flex items-center">
                    <p className="text-xs ml-auto w-fit">
                      {moment(msg.createdAt).format("hh:mm")}
                    </p>
                    &nbsp;
                   {  user._id === msg?.msgByUserId && <p className="text-xs">
                      {  msg.seen ? (
                        <IoCheckmarkDone className="text-blue-600" />
                      ) : (
                        <MdDone />
                      )}
                    </p>}
                  </div>
                ) : (
                  ""
                )}
                {/* edit and delete message */}
                {activeMessageId === msg._id && !msg?.isDeleted && (
                  <div className="bg-white rounded  right-5 bottom-20 w-36 p-2 ease-in">
                    <form>
                      <label
                        onClick={() => handleEditText(msg)}
                        className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                      >
                        <div className="text-primary">
                          <MdModeEditOutline size={20} />
                        </div>
                        <p>Edit </p>
                      </label>
                      <label
                        onClick={() => handleDeleteText(msg._id)}
                        className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                      >
                        <div className="text-primary">
                          <MdDeleteOutline size={20} />
                        </div>
                        <p>Delete</p>
                      </label>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/**upload Image display */}
        {message.imageUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600"
              onClick={handleClearUploadImage}
            >
              <IoClose size={30} />
            </div>
            <div className="bg-white p-1">
              <img
                src={message.imageUrl}
                alt="uploadImage"
                className="aspect-auto w-96 h-full max-w-sm m-1  object-scale-down"
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      {/**send message */}
      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative ">
          <button
            onClick={handleUploadImageVideoOpen}
            className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-grey"
          >
            {openImageVideoUpload ? (
              <RxCross2 size={26} />
            ) : (
              <FaPlus size={20} />
            )}
          </button>

          {/**video and image */}
          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2">
              <div>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>

                <input
                  type="file"
                  id="uploadImage"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <hr />
                <label
                  onClick={handleOpenCamera}
                  htmlFor=""
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaCamera size={18} />
                  </div>
                  <p>Camera</p>
                </label>

                <CameraModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  onCapture={handleCapturePhoto}
                />
              </div>
            </div>
          )}
        </div>

        {/**input box */}
        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type here message..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleOnChange}
          />
          <button className="text-primary hover:text-secondary">
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;

// opening selfie / inbuild camera , to click photo .

export function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);

  const openCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    } else {
      alert("Camera not supported on this device");
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    onCapture(imageData);
    closeCamera();
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    videoRef.current.srcObject = null;
    onClose();
  };

  if (isOpen) {
    openCamera();
  }

  return (
    isOpen && (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center">
        <div className="relative bg-transparent p-4 rounded-lg backdrop-blur-sm">
          <button
            onClick={closeCamera}
            className="absolute top-2 right-2 text-black-800"
          >
            ✕
          </button>
          <video ref={videoRef} className="w-96 h-auto" autoPlay></video>
          <div className="text-center">
            <button
              onClick={capturePhoto}
              className="mt-4 px-4 py-2 bg-blue-900 text-white rounded"
            >
              <FaCamera />
            </button>
          </div>
        </div>
      </div>
    )
  );
}
