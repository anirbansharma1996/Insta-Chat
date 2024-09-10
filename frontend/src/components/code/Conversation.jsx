import React from "react";
import moment from "moment";
import {
  MdDone,
  MdDeleteOutline,
  MdModeEditOutline,
  MdOutlineReply,
} from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import Loading from "../Loading";

const Conversation = ({
  handleEditText,
  handleDeleteText,
  allMessage,
  currentMessage,
  handleEditDeleteMessage,
  activeMessageId,
  handleReply,
  dataUser,
  user,
  loading,
}) => {
  return (
    <div className="flex flex-col gap-2 py-2 mx-2 " ref={currentMessage}>
      {loading ? (
        <Loading />
      ) : (
        allMessage.map((msg) => {
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
              {/* edit and delete message */}
              {activeMessageId === msg._id && !msg?.isDeleted && (
                <div className="bg-white rounded mb-1  right-5 bottom-20 w-36 p-2 ease-in">
                  <form>
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
                      !msg.imageUrl &&
                      !msg.audioUrl &&
                      !msg.videoUrl && (
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
                        <p>Delete</p>
                      </label>
                    )}
                  </form>
                </div>
              )}
              <div className="w-full relative">
                {msg?.imageUrl && !msg?.isDeleted && (
                  <img
                    src={!msg?.isDeleted && msg?.imageUrl}
                    className="w-full h-full object-scale-down"
                  />
                )}
                {msg?.videoUrl && !msg?.isDeleted && (
                  <video
                    controls
                    autoPlay
                    src={!msg?.isDeleted && msg?.videoUrl}
                    className="w-full h-full object-scale-down"
                  />
                )}
              </div>
              <div className="w-full relative">
                {!msg?.isDeleted && msg?.audioUrl && (
                  <audio
                    src={!msg?.isDeleted && msg?.audioUrl}
                    controls
                    className="w-60 mb-3"
                  />
                )}
              </div>
              {msg?.isDeleted ? (
                <p className="px-2 text-gray-400">
                  {"this message hasbeen deleted..."}
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
                    {msg?.replyTo?.imageUrl && (
                      <img
                        className="mt-1 w-36"
                        src={msg?.replyTo?.imageUrl}
                        alt={msg.replyTo._id}
                      />
                    )}
                    {msg?.replyTo?.videoUrl && (
                      <video
                        controls
                        autoPlay
                        className="mt-1 w-36"
                        src={msg?.replyTo?.videoUrl}
                        alt={msg.replyTo._id}
                      />
                    )}
                    {msg?.replyTo?.audioUrl && (
                      <audio
                        className="w-60 mt-1"
                        controls
                        src={msg?.replyTo?.audioUrl}
                      />
                    )}
                  </div>
                  <p class="text-base">{msg?.text}</p>
                </>
              ) : msg?.ogData ? (
                <>
                  <div className="og-preview bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden max-w-xs">
                    <a
                      href={msg.ogData.url}
                      target="_blank"
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
                </>
              ) : (
                <p className="px-2 text-base">{msg.text}</p>
              )}
              {!msg?.isDeleted && (
                <div className="flex items-center">
                  <p className="text-xs ml-auto w-fit">
                    {msg.isEdited && "Edited"} &nbsp;
                    {moment(msg.createdAt).format("hh:mm A")}
                  </p>
                  &nbsp;
                  {user._id === msg?.msgByUserId && (
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
          );
        })
      )}
    </div>
  );
};

export default Conversation;
