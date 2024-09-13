import React from "react";
import Loading from "./Loading";
import MessageInput from "./code/MessageInput";
import Header from "./code/Header";
import ReplyingMessage from "./code/ReplyingMessage";
import Conversation from "./code/Conversation";
import ImageModal from "./code/ImageModal";
import DisplayUploadingImages from "./code/DisplayUploadingImages";
import useChatLogic from "../hook/useChatLogic";
import { AudioComponent } from "./code/AudioComponent";
import { BlockedUI } from "./code/BlockedUI";

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
    setReplyingMessage,
    handleUploadVideo,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isVideoCallActive,
    callAccepted,
    callRejected,
    callType,
    localVideoRef,
    remoteVideoRef,
    peerConnection,
    incomingCall,
    joinroom,
    ogData,
    formatDate,
    groupedMessages,
    emojis,
    handleReact
  } = useChatLogic();

  return (
    <div
      style={{backgroundImage: `url(${"https://wallpapercave.com/wp/wp9875549.jpg"})`}}
      className="bg-no-repeat bg-cover"
    >
      <Header
        joinroom={joinroom}
        startCall={startCall}
        acceptCall={acceptCall}
        rejectCall={rejectCall}
        endCall={endCall}
        isVideoCallActive={isVideoCallActive}
        callAccepted={callAccepted}
        callRejected={callRejected}
        callType={callType}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        peerConnection={peerConnection}
        user={user}
        dataUser={dataUser}
        isTyping={isTyping}
        handleBlockFn={handleBlockFn}
        handleUnblockFn={handleUnblockFn}
        handleBlockUnblockUser={handleBlockUnblockUser}
        blockModal={blockModal}
        incomingCall={incomingCall}
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
          loading={loading}
          formatDate={formatDate}
          groupedMessages={groupedMessages}
          handleReact={handleReact}
          emojis={emojis}
        />

        {/**upload Image display */}
        {(message?.imageUrl || message.videoUrl) && (
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
                    handleUploadVideo={handleUploadVideo}
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
                ogData={ogData}
                loading={loading}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagePage;
