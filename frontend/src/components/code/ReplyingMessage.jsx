import React from "react";
import { RiRobot3Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ReplyingMessage = ({
  replyingMessage,
  handleAiReply,
  setReplyingMessage,
}) => {
  return (
    <div className="px-10 bg-slate-100 flex justify-between items-center ">
      <div className="m-4 flex items-center justify-between">
        {replyingMessage?.text && (
          <div className="flex gap-3">
            <h6>Replying to : &nbsp;</h6>
            <p className="reply-message font-semibold">
              {replyingMessage?.text}
            </p>
          </div>
        )}
        {replyingMessage?.imageUrl && (
          <>
            <h5>Replying to : &nbsp;</h5>
            <img
              className="w-24"
              src={replyingMessage?.imageUrl}
              alt={replyingMessage._id}
            />
          </>
        )}
        {replyingMessage?.audioUrl && (
          <audio
            className="w-60 p-1"
            controls
            src={replyingMessage?.audioUrl}
          />
        )}
      </div>
      <div className="flex ">
        <button
          onClick={() => handleAiReply(replyingMessage?.text)}
          className="hover:bg-gray-300 px-2 py-1"
        >
          <RiRobot3Line size={20} className="text-red-700" />
        </button>
        &nbsp;&nbsp;&nbsp;
        <button onClick={() => setReplyingMessage(null)}>
          <RxCross2 size={22} />
        </button>
      </div>
    </div>
  );
};

export default ReplyingMessage;
