import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  MdDone,
  MdDeleteOutline,
  MdModeEditOutline,
  MdOutlineReply,
} from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import Loading from "../Loading";
import DateSeparator from "./DateSeparator";
import { useSelector } from "react-redux";

const Conversation = ({
  handleEditText,
  handleDeleteText,
  currentMessage,
  handleEditDeleteMessage,
  activeMessageId,
  handleReply,
  dataUser,
  user,
  loading,
  formatDate,
  groupedMessages,
  handleReact,
  emojis,
}) => {
  const socket = useSelector((state) => state?.user?.socketConnection);

  const handleDeleteTextForMe = (u_id, m_id) => {
    socket.emit("delete-user-messages", { userId: u_id, messageId: m_id });
  };

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("conversation", (data) => {
  //       const conversationUserData = data.map((conversationUser) => {
  //         if (
  //           conversationUser?.sender?._id === conversationUser?.receiver?._id
  //         ) {
  //           return {
  //             ...conversationUser,
  //             userDetails: conversationUser?.sender,
  //           };
  //         } else if (conversationUser?.receiver?._id !== user?._id) {
  //           return {
  //             ...conversationUser,
  //             userDetails: conversationUser.receiver,
  //           };
  //         } else {
  //           return {
  //             ...conversationUser,
  //             userDetails: conversationUser.sender,
  //           };
  //         }
  //       });
  //       setConvo(conversationUserData);
  //     });
  //   }
  // }, [socket, user]);

  //console.log(convo);
  //const response = convo?.map((el) => el.deletedFor);
  //console.log(response);

  return (
    <div
      className="flex flex-col gap-2 py-2 mx-2"
      ref={currentMessage}
    >
      {loading ? (
        <Loading />
      ) : (
        Object.entries(groupedMessages).map(([date, messages]) => (
          <React.Fragment key={date}>
            <DateSeparator date={formatDate(date)} />
            {messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleEditDeleteMessage(msg)}
                className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
                  user._id === msg?.msgByUserId
                    ? "ml-auto bg-teal-100"
                    : "bg-white"
                } cursor-pointer`}
              >
                {/* Edit and delete message */}
                {activeMessageId === msg._id &&
                  !msg?.isDeleted &&
                  !msg.deletedFor.includes(user._id) && (
                    <div className="bg-white rounded mb-1 right-5 bottom-20 w-36 p-2 ease-in">
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {dataUser?._id == msg.msgByUserId &&
                            emojis.map((emoji) => (
                              <button
                                key={emoji}
                                className="text-md bg-white"
                                onClick={() => handleReact(msg._id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                        </div>
                        <label
                          onClick={() => handleReply(msg)}
                          className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                        >
                          <div className="text-primary">
                            <MdOutlineReply size={20} />
                          </div>
                          <p>Reply</p>
                        </label>
                        {dataUser?._id !== msg.msgByUserId &&
                          !msg?.media?.imageUrl &&
                          !msg?.media?.audioUrl &&
                          !msg?.media?.videoUrl && (
                            <label
                              onClick={() => handleEditText(msg)}
                              className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                            >
                              <div className="text-primary">
                                <MdModeEditOutline size={20} />
                              </div>
                              <p>Edit </p>
                            </label>
                          )}
                        {dataUser?._id !== msg.msgByUserId && (
                          <label
                            onClick={() => handleDeleteText(msg._id)}
                            className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                          >
                            <div className="text-primary">
                              <MdDeleteOutline size={20} />
                            </div>
                            <p> Everyone</p>
                          </label>
                        )}
                        {dataUser?._id !== msg.msgByUserId && (
                          <label
                            onClick={() =>
                              handleDeleteTextForMe(user._id, msg._id)
                            }
                            className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                          >
                            <div className="text-primary">
                              <MdDeleteOutline size={20} />
                            </div>
                            <p>Me</p>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                <div className="w-full relative">
                  {msg?.media?.imageUrl &&
                    !msg?.isDeleted &&
                    !msg.deletedFor.includes(user._id) && (
                      <img
                        src={
                          !msg?.isDeleted &&
                          !msg.deletedFor.includes(user._id) &&
                          msg?.media?.imageUrl
                        }
                        className="w-full h-full object-scale-down"
                        alt="Message"
                      />
                    )}
                  {msg?.media?.videoUrl &&
                    !msg.deletedFor.includes(user._id) &&
                    !msg?.isDeleted && (
                      <video
                        controls
                        autoPlay
                        src={
                          !msg?.isDeleted &&
                          !msg.deletedFor.includes(user._id) &&
                          msg?.media?.videoUrl
                        }
                        className="w-full h-full object-scale-down"
                        alt="Message"
                      />
                    )}
                </div>
                <div className="w-full relative">
                  {!msg?.isDeleted && msg?.media?.audioUrl && (
                    <audio
                      src={!msg?.isDeleted && msg?.media?.audioUrl}
                      controls
                      className="w-60 mb-3"
                    />
                  )}
                </div>
                {msg?.isDeleted ? (
                  <p className="px-2 text-gray-400">
                    {"this message has been deleted..."}
                  </p>
                ) : msg?.replyTo ? (
                  <>
                    <div className="border-l-4 border-teal-600 bg-white p-2 rounded mb-2">
                      <p className="text-xs text-teal-600">Replying to</p>
                      {msg?.replyTo?.text && (
                        <p className="text-sm text-gray-600">
                          {msg?.replyTo?.text}
                        </p>
                      )}
                      {msg?.replyTo?.media?.imageUrl && (
                        <img
                          className="mt-1 w-36"
                          src={msg?.replyTo?.media?.imageUrl}
                          alt={msg.replyTo._id}
                        />
                      )}
                      {msg?.replyTo?.media?.videoUrl && (
                        <video
                          controls
                          autoPlay
                          className="mt-1 w-36"
                          src={msg?.replyTo?.media?.videoUrl}
                          alt={msg.replyTo._id}
                        />
                      )}
                      {msg?.replyTo?.media?.audioUrl && (
                        <audio
                          className="w-60 mt-1"
                          controls
                          src={msg?.replyTo?.media?.audioUrl}
                        />
                      )}
                    </div>
                    <p className="text-base">{msg?.text}</p>
                  </>
                ) : msg?.ogData ? (
                  <>
                    <div className="og-preview bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden max-w-xs">
                      <a
                        href={msg.ogData.url}
                        target="_self"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        {msg.ogData.image && (
                          <img
                            src={msg.ogData.image}
                            alt="OG Preview"
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-3">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {msg.ogData.title}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {msg.ogData.description}
                          </p>
                        </div>
                      </a>
                    </div>
                    <a
                      href={msg.ogData.url}
                      className="px-2 py-1 text-sm text-blue-400"
                    >
                      {msg.ogData.url}
                    </a>
                    <p className="flex px-2 text-base relative">
                      <span className="absolute -bottom-9 right-0">
                        {msg?.reaction}
                      </span>{" "}
                    </p>
                  </>
                ) : (
                  <p className="flex px-2 text-base relative">
                    {!msg.deletedFor.includes(user._id) ? (
                      msg.text
                    ) : (
                      <span className="text-gray-400 text-sm">
                        this message hasbeen deleted by you ...
                      </span>
                    )}
                    <span className="absolute -bottom-10 right-0">
                      {msg?.reaction}
                    </span>
                  </p>
                )}
                {!msg.deletedFor.includes(user._id) && !msg?.isDeleted && (
                  <div className="flex items-center">
                    <p className="text-xs ml-auto w-fit">
                      {msg.isEdited && "Edited"} &nbsp;
                      {!msg.deletedFor.includes(user._id) &&
                        moment(msg.createdAt).format("hh:mm A")}
                    </p>
                    &nbsp;
                    {user._id === msg?.msgByUserId &&
                      !msg.deletedFor.includes(user._id) && (
                        <p className="text-xs">
                          {msg.seen ? (
                            <IoCheckmarkDone className="text-blue-600" />
                          ) : (
                            <MdDone />
                          )}
                        </p>
                      )}
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default Conversation;
