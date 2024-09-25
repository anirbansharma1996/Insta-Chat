import React, { useEffect, useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import Avatar from "./Avatar";
import { NavLink, useNavigate } from "react-router-dom";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { FiArrowUpLeft } from "react-icons/fi";
import { BiLogOut } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import EditUserDetails from "./EditUser";
import SearchUser from "./SearchUser";
import Loading from "./Loading";
import moment from "moment";
import { IoMdMic } from "react-icons/io";
import { MdFeaturedVideo } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { REACT_APP_BACKEND_URL } from "../../env";

const Sidebar = () => {
  const [loginUser, setLoginUser] = useState(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state?.user);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user details and handle token expiration
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/email";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setLoginUser(decoded);

      // Handle token expiration
      if (decoded.exp < Date.now() / 1000) {
        handleLogout();
      } else {
        const expInMs = (decoded.exp - Date.now() / 1000) * 1000;
        setTimeout(handleLogout, expInMs);
      }
    } catch (error) {
      console.error("Invalid token", error);
      handleLogout();
    }
  }, []);

  // Fetch conversation data from the backend (update based on your routes)
  useEffect(() => {
    setIsLoading(true);

    const fetchConversations = async () => {
      try {
        // Make an API call to get the conversation details
        const response = await axios.get(
          `${REACT_APP_BACKEND_URL}/conversation`,
          {
            params: {
              currentUserId: user._id,
              page: 1
            },
          }
        );
        const conversationData = response?.data?.conversation?.map((conversationUser) => {
          if (
            conversationUser?.sender?._id === conversationUser?.receiver?._id
          ) {
            return {
              ...conversationUser,
              userDetails: conversationUser?.sender,
            };
          } else if (conversationUser?.receiver?._id !== user?._id) {
            return {
              ...conversationUser,
              userDetails: conversationUser.receiver,
            };
          } else {
            return {
              ...conversationUser,
              userDetails: conversationUser.sender,
            };
          }
        });
        setAllUser(conversationData);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchConversations();
    }
  }, [user]);

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
    navigate("/email");
    localStorage.removeItem("token");
  };

  // Delete conversation function
  const handleChatDelete = (c_id, u_id) => {
    socketConnection.emit("delete-conversation", {
      conversationId: c_id,
      userId: u_id,
    });
  };



  //console.log(allUser)

  return (
    <div className="w-full h-full grid grid-cols-[48px,1fr] bg-white">
      <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
        <div>
          <NavLink
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${
                isActive && "bg-slate-200"
              }`
            }
            title="chat"
          >
            <IoChatbubbleEllipses size={20} />
          </NavLink>

          <div
            title="add friend"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
          >
            <FaUserPlus size={20} />
          </div>
          <div
            onClick={() => navigate("/features")}
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
          >
            <MdFeaturedVideo size={20} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="mx-auto"
            title={user?.name}
            onClick={() => setEditUserOpen(true)}
          >
            <Avatar
              width={40}
              height={40}
              name={user?.name}
              imageUrl={user?.profile_pic}
              userId={user?._id}
            />
          </button>
          <button
            title="logout"
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
            onClick={handleLogout}
          >
            <span className="-ml-2">
              <BiLogOut size={20} />
            </span>
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="h-16 flex items-center">
          <h2 className="text-xl font-bold p-4 text-slate-800">Message</h2>
        </div>
        <div className="bg-slate-200 p-[0.5px]"></div>

        <div className="h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
          {isLoading && (
            <div className="mt-40">
              {" "}
              <Loading />
            </div>
          )}
          {!isLoading && allUser.length === 0 && (
            <div className="mt-12">
              <div className="flex justify-center items-center my-4 text-slate-500">
                <FiArrowUpLeft size={50} />
              </div>
              <p className="text-lg text-center text-slate-400">
                Explore users to start a conversation with.
              </p>
            </div>
          )}

          {!isLoading &&
            allUser?.map((conv, index) => {
              return (
                <div
                  className="flex justify-between items-center"
                  key={conv._id}
                >
                  <NavLink
                    to={"/" + conv?.userDetails?._id}
                    className="flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer"
                  >
                    <div>
                      <Avatar
                        imageUrl={conv?.userDetails?.profile_pic}
                        name={conv?.userDetails?.name}
                        width={40}
                        height={40}
                        userId={conv?.userDetails?._id}
                      />
                    </div>
                    <div>
                      <h3 className="text-ellipsis line-clamp-1 font-semibold text-base">
                        {conv?.userDetails?.name}
                      </h3>
                      <div className="text-slate-500 text-xs flex items-center gap-1">
                        <div className="flex items-center gap-1">
                          {conv?.lastMsg?.imageUrl && (
                            <div className="flex items-center gap-1">
                              <span>
                                <FaImage />
                              </span>
                              {!conv?.lastMsg?.text && <span>Image</span>}
                            </div>
                          )}
                          {conv?.lastMsg?.audioUrl && (
                            <div className="flex items-center gap-1">
                              <span>
                                <IoMdMic />
                              </span>
                              {!conv?.lastMsg?.text && <span>Audio</span>}
                            </div>
                          )}
                        </div>
                        <p className="line-clamp-1 text-gray-400">
                          {!conv?.lastMsg.isDeleted
                            ? conv?.lastMsg?.text
                            : "( This message has been deleted... )"}{" "}
                          [{" "}
                          {!conv?.lastMsg.isDeleted &&
                            moment(conv?.lastMsg?.createdAt).format(
                              "hh:mm A"
                            )}{" "}
                          ]
                        </p>
                      </div>
                    </div>
                    {Boolean(conv?.unseenMsg) && (
                      <p className="text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full">
                        {conv?.unseenMsg}
                      </p>
                    )}
                  </NavLink>

                  {/* <MdDeleteOutline
                    size={20}
                    className="cursor-pointer hover:text-red-400"
                    onClick={() =>
                      handleChatDelete(conv?._id, conv?.userDetails?._id)
                    }
                  /> */}
                </div>
              );
            })}
        </div>
      </div>

      {editUserOpen && (
        <EditUserDetails
          close={() => setEditUserOpen(false)}
          profile_pic={user?.profile_pic}
          name={user?.name}
          id={user?._id}
        />
      )}
      {openSearchUser && (
        <SearchUser
          open={openSearchUser}
          close={() => setOpenSearchUser(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
