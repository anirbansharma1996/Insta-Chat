import React from "react";
import { FiPhone, FiVideo, FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

const  VideoCall = ({
  isVideoCallActive,
  callAccepted,
  callRejected,
  localVideoRef,
  remoteVideoRef,
  incomingCall,
  acceptCall,
  rejectCall,
  endCall,
  dataUser,
}) => {


  const [searchParams] = useSearchParams();
  const remoteId = searchParams.get("q");


  return (
    <div className="video-call-container fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 p-4">
      {/* Display call status */}
      {isVideoCallActive && !callAccepted && !callRejected && (
        <div className="bg-green-500 text-white rounded-lg px-4 py-2 flex items-center space-x-2">
          <FiVideo className="text-xl" />
          <span>Calling {dataUser.name}...</span>
        </div>
      )}

      {/* Incoming call notification */}
      {incomingCall && !callAccepted && (
        <div className="bg-white text-black rounded-lg px-6 py-4 shadow-lg space-y-4">
          <div className="text-lg font-semibold">
            Incoming Video call from <br />
            <h2 className="text-center text-2xl">{dataUser.name}</h2>
          </div>
          <div className="flex justify-between space-x-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
              onClick={acceptCall}
            >
              <FiPhone className="text-xl" />
              <span>Accept</span>
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
              onClick={rejectCall}
            >
              <FiX className="text-xl" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Video call UI */}
      {remoteId && callAccepted && !callRejected && (
        <div className="relative w-full max-w-md h-auto bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            className="w-72 h-auto object-cover"
            autoPlay
            muted
            playsInline
          />
          <video
            ref={remoteVideoRef}
            className="absolute inset-0 w-72 h-full object-cover"
            autoPlay
            playsInline
          />
          <button
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
            onClick={endCall}
          >
            <FiX className="text-2xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall
