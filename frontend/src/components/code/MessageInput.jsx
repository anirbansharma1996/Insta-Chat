import React from "react";
import { IoMdSend, IoMdMic } from "react-icons/io";
import { FaImage, FaCamera } from "react-icons/fa";
import { IoClose, IoStopCircleOutline } from "react-icons/io5";

const MessageInput = ({
  handleSendMessage,
  audioUrl,
  handleClearUploadAudio,
  aiLoading,
  handleOnChange,
  message,
  isRecording,
  startRecording,
  stopRecording
}) => {
  return (
    <form
    className="h-full w-full flex gap-2"
    onSubmit={handleSendMessage}
  >
    {audioUrl && (
      <div className="sticky bottom-0 w-full sm:w-96 md:w-80 lg:w-full bg-white bg-opacity-80 flex  items-center p-3">
        <div className="flex items-center w-full sm:w-96 md:w-80 lg:w-full   rounded overflow-hidden">
          <audio className="w-full" controls src={audioUrl} />
          <div
            className="ml-3 p-2 cursor-pointer hover:text-red-600"
            onClick={handleClearUploadAudio}
          >
            <IoClose size={24} />
          </div>
        </div>
      </div>
    )}
    {!audioUrl && (
      <textarea
        placeholder={
          aiLoading ? "AI is thinking..." : "Type here message..."
        }
        className="z-50 py-2 px-4 outline-none w-full resize-none overflow-hidden rounded-lg "
        value={message?.text}
        onChange={handleOnChange}
        rows={1}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />
    )}
    {isRecording && (
      <div className="relative flex items-center justify-center">
        <div className="recording-indicator">
          <div className="pulse"></div>
          <div className="pulse"></div>
          <div className="pulse"></div>
          <div className="pulse"></div>
          <div className="pulse"></div>
          <div className="pulse"></div>
        </div>
      </div>
    )}

    {isRecording ? (
      <button
        type="button"
        onClick={stopRecording}
        className="text-primary hover:text-secondary"
      >
        <IoStopCircleOutline size={28} />
      </button>
    ) : (
      !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="text-primary hover:text-secondary"
        >
          <IoMdMic size={28} />
        </button>
      )
    )}

    <button className="text-primary hover:text-secondary">
      <IoMdSend size={28} />
    </button>
  </form>
  );
};

export default MessageInput;
