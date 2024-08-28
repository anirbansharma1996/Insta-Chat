// opening selfie / inbuild camera , to click photo .

import { useRef } from "react";
import { FaCamera } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

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
            className="absolute top-0 right-2 text-white"
          >
            <IoClose size={30} />
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
