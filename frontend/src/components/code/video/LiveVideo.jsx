import { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-react";
import { MdCallEnd, MdVideocamOff, MdVideocam, MdMicOff, MdMic } from "react-icons/md";

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

const APP_ID = "04b6e7993ff44400b5101b66138a68f6";
const CHANNEL = "testandtest";
const TOKEN =
  "007eJxTYDjyft3/J4HC0/ZVb5ggezZxxrdcjfz1t9ZKTjnYyMd+bX2KAoOBSZJZqrmlpXFamomJiYFBkqmhgWGSmZmhsUWimUWamdqBe2kNgYwMT5tCGBihEMTnZihJLS5JzEsBUQwMAPTUJEY=";

export const LiveVideo = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      setUsers((prevUsers) => {
        if (prevUsers.some((u) => u.uid === user.uid)) {
          return prevUsers;
        }
        return [...prevUsers, user];
      });
    }
  };

  const handleUserLeft = (user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  const disconnect = () => {
    client.leave().then(() => {
      localTracks.forEach((track) => {
        track.stop();
        track.close();
      });
      setLocalTracks([]);
      setUsers([]);
      window.location.href = "/";
    });
  };

  const toggleMute = () => {
    localTracks[0].setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localTracks[1].setMuted(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  useEffect(() => {
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    client
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) =>
        Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid])
      )
      .then(([tracks, uid]) => {
        setLocalTracks(tracks);
        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack: tracks[1],
            audioTrack: tracks[0],
          },
        ]);
        client.publish(tracks);
      });

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish(localTracks).then(() => client.leave());
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="flex flex-wrap justify-center gap-1 mb-4 -mt-12">
          {users.map((user) => (
            <VideoPlayer key={user.uid} user={user} />
          ))}
        </div>
        <div className="flex space-x-4 justify-center">
          {/* video stop start , audio mute and unmute */}
          {/* <button
            onClick={toggleMute}
            className="bg-gray-800 rounded-full p-3 text-white hover:bg-gray-700"
          >
            {isMuted ? <MdMicOff size={25} /> : <MdMic size={25} />}
          </button>
          <button
            onClick={toggleVideo}
            className="bg-gray-800 rounded-full p-3 text-white hover:bg-gray-700"
          >
            {isVideoOff ? <MdVideocamOff size={25} /> : <MdVideocam size={25} />}
          </button> */}
          <button
            onClick={disconnect}
            className="bg-red-500 rounded-full p-3 text-white hover:bg-red-600"
          >
            <MdCallEnd size={25} />
          </button>
        </div>
      </div>
    </>
  );
};

const VideoPlayer = ({ user }) => {
  const ref = useRef();

  useEffect(() => {
    user.videoTrack.play(ref.current);
  }, [user.videoTrack]);

  return (
    <div className="flex flex-col items-center bg-gray-800 bg-opacity-20 p-0 rounded ">
      <div ref={ref} className="w-96 h-60 bg-black rounded"></div>
    </div>
  );
};
