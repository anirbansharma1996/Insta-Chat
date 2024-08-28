import React from "react";
import { IoClose } from "react-icons/io5";

const DisplayUploadingImages = ({ handleClearUploadImage, message }) => {
  return (
    <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
      <div className="bg-white p-1">
        <div
          className="w-fit p-2 cursor-pointer hover:text-red-600"
          onClick={handleClearUploadImage}
        >
          <IoClose size={20} />
        </div>
        <img
          src={message?.imageUrl}
          alt="uploadImage"
          className="aspect-auto w-72 h-full max-w-sm m-1  object-scale-down"
        />
      </div>
    </div>
  );
};

export default DisplayUploadingImages;
