import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const VideoCall = ({ roomID, user, dataUser }) => {
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);
  const [callType, setCallType] = useState("");
  const [roomId, setRoomId] = useState("");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    socketConnection.on("incoming-video-call", ({ from, roomId, callType }) => {
      console.log(from, roomId, callType);
      setIncomingCall({ from, roomId, callType });
    });
    socketConnection.on("accept-call", () => {
      setCallAccepted(true);
      joinRoom(roomId);
    });
    socketConnection.on("video-call-rejected", () => {
      setCallRejected(true);
      endCall();
    });
    return () => {
      socketConnection.off("incoming-video-call");
      socketConnection.off("accept-call");
      socketConnection.off("video-call-rejected");
    };
  }, [socketConnection, user , roomId]);

  const startCall = (callType) => {
    setCallType(callType);
    setRoomId(roomID);
    setIsCalling(true);
    socketConnection.emit("outgoing-video-call", {
      from: { _id: user._id },
      to: dataUser._id,
      roomId: roomID,
      callType,
    });
    setTimeout(() => {
      if (!callAccepted) {
        setIsCalling(false);
        endCall();
      }
    }, 30000);
  };

  const acceptCall = () => {
    socketConnection.emit("accept-incoming-call", { id: incomingCall.from });
    setCallAccepted(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socketConnection.emit("reject-video-call", { from: incomingCall.from });
    setCallRejected(true);
    setIncomingCall(null);
  };

  //   const joinRoom = async (roomId) => {
  //     peerConnection.current = new RTCPeerConnection();

  //     // Get local media stream
  //     const localStream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });

  //     localStream.getTracks().forEach((track) => {
  //       peerConnection.current.addTrack(track, localStream);
  //     });

  //     localVideoRef.current.srcObject = localStream;

  //     peerConnection.current.ontrack = (event) => {
  //       remoteVideoRef.current.srcObject = event.streams[0];
  //     };

  //     peerConnection.current.onicecandidate = (event) => {
  //       if (event.candidate) {
  //         socketConnection.emit("ice-candidate", {
  //           roomId,
  //           candidate: event.candidate,
  //         });
  //       }
  //     };

  //     // Join room
  //     socketConnection.emit("join-room", { roomId });

  //     // Handle ICE candidate exchange
  //     socketConnection.on("ice-candidate", (candidate) => {
  //       peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  //     });

  //     // Handle offer and answer exchange
  //     socketConnection.on("offer", async (offer) => {
  //       await peerConnection.current.setRemoteDescription(offer);
  //       const answer = await peerConnection.current.createAnswer();
  //       await peerConnection.current.setLocalDescription(answer);
  //       socketConnection.emit("answer", { roomId, answer });
  //     });

  //     socketConnection.on("answer", async (answer) => {
  //       await peerConnection.current.setRemoteDescription(answer);
  //     });
  //   };

  const endCall = () => {
    peerConnection.current.close();
    socketConnection.emit("reject-video-call", { from: incomingCall.from });
    setCallRejected(true);
    setIncomingCall(null);
  };

  console.log(incomingCall)

  return (
    <div className="video-call-container">
      {isCalling && !callAccepted && !callRejected && <div>Calling...</div>}
      {incomingCall && !callAccepted && (
        <div>
          <div>Incoming call from {incomingCall.from}</div>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
      {callAccepted && (
        <div>
          <video ref={localVideoRef} autoPlay muted />
          <video ref={remoteVideoRef} autoPlay />
          <button onClick={endCall}>End Call</button>
        </div>
      )}
      {!isCalling && !incomingCall && (
        <div>
          <button onClick={() => startCall("video")}>Start Video Call</button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
