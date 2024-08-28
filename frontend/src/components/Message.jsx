import React from "react";
import { FaPlus } from "react-icons/fa6";
import Loading from "./Loading";
import { RxCross2 } from "react-icons/rx";
import MessageInput from "./code/MessageInput";
import Header from "./code/Header";
import ReplyingMessage from "./code/ReplyingMessage";
import Conversation from "./code/Conversation";
import ImageModal from "./code/ImageModal";
import DisplayUploadingImages from "./code/DisplayUploadingImages";
import useChatLogic from "../hook/useChatLogic";

const MessagePage = () => {
  const {
    user,
    dataUser,
    allMessage,
    message,
    isTyping,
    audioUrl,
    blockModal,
    isModalOpen,
    replyingMessage,
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
    activeMessageId,
    setReplyingMessage 
  } = useChatLogic();

  return (
    <div
      style={{
        backgroundImage: `url(${"https://wallpapercave.com/wp/wp9875549.jpg"})`,
      }}
      className="bg-no-repeat bg-cover"
    >
      <Header
        user={user}
        dataUser={dataUser}
        isTyping={isTyping}
        handleBlockFn={handleBlockFn}
        handleUnblockFn={handleUnblockFn}
        handleBlockUnblockUser={handleBlockUnblockUser}
        blockModal={blockModal}
      />
      {/***show all message */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        <Conversation
          allMessage={allMessage}
          currentMessage={currentMessage}
          handleEditDeleteMessage={handleEditDeleteMessage}
          activeMessageId={activeMessageId}
          handleReply={handleReply}
          dataUser={dataUser}
          user={user}
          handleDeleteText={handleDeleteText}
          handleEditText={handleEditText}
        />

        {/**upload Image display */}
        {message?.imageUrl && (
          <DisplayUploadingImages
            handleClearUploadImage={handleClearUploadImage}
            message={message}
          />
        )}
        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>
      <div className="sticky bottom-0.5">
        {replyingMessage && (
          <ReplyingMessage
            replyingMessage={replyingMessage}
            handleAiReply={handleAiReply}
            setReplyingMessage={setReplyingMessage}
          />
        )}

        <section
          className=" bg-white flex items-center px-4 pb-5"
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          style={{ height: "auto" }}
        >
          {user?.blockedUsers.includes(dataUser._id) ||
          user?.blockedBy.includes(dataUser._id) ? (
            <BlockedUI />
          ) : (
            <>
              <div className="relative ">
                {!audioUrl && (
                  <AudioComponent
                    handleUploadImageVideoOpen={handleUploadImageVideoOpen}
                    openImageVideoUpload={openImageVideoUpload}
                  />
                )}

                {/**video and image upload */}
                {openImageVideoUpload && (
                  <ImageModal
                    handleUploadImage={handleUploadImage}
                    handleOpenCamera={handleOpenCamera}
                    isModalOpen={isModalOpen}
                    handleCloseModal={handleCloseModal}
                    handleCapturePhoto={handleCapturePhoto}
                  />
                )}
              </div>
              {/**input box */}
              <MessageInput
                handleSendMessage={handleSendMessage}
                audioUrl={audioUrl}
                handleClearUploadAudio={handleClearUploadAudio}
                aiLoading={aiLoading}
                handleOnChange={handleOnChange}
                message={message}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagePage;

export const AudioComponent = ({
  handleUploadImageVideoOpen,
  openImageVideoUpload,
}) => {
  return (
    <button
      onClick={handleUploadImageVideoOpen}
      className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-grey"
    >
      {openImageVideoUpload ? <RxCross2 size={26} /> : <FaPlus size={20} />}
    </button>
  );
};

export const BlockedUI = () => {
  return (
    <p className="text-gray-400 pb-4 text-center w-full">
      <i>You have blocked </i>{" "}
    </p>
  );
};
