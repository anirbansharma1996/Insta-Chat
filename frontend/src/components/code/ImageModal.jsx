import React from "react";
import { CameraModal } from "./CameraModal";
import { FaCamera, FaImage } from "react-icons/fa6";

const ImageModal = ({
  handleUploadImage,
  handleOpenCamera,
  isModalOpen,
  handleCloseModal,
  handleCapturePhoto,
}) => {
  return (
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
  );
};

export default ImageModal;
