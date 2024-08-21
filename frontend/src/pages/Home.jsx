import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { REACT_APP_BACKEND_URL } from "../../env.js";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  setOnlineUser,
  setSocketConnection,
  setUser,
} from "../redux/userSlice.js";
import Sidebar from "../components/Sidebar.jsx";
import io from "socket.io-client";

const Home = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tk = localStorage.getItem("token");
  const URL = `${REACT_APP_BACKEND_URL}/user-details/${tk}`;

  if (!tk) {
    navigate("/email");
  }

  const fetchUserDetails = async () => {
    try {
      const response = await axios({
        url: URL,
        withCredentials: true,
      });
      dispatch(setUser(response.data.data));

      if (response?.data?.data?.logout) {
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      toast.error("something went wrong");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);


const IO_URL = "https://chat-app-backend-449e.onrender.com/"
//const IO_URL = "http://127.0.0.1:8080"

  // socket connection
  useEffect(() => {
    const socketConnection = io(IO_URL, {
      auth: {
        token: tk,
      },
    });
    socketConnection.on("onlineUser", (data) => {
      dispatch(setOnlineUser(data));
    });
    dispatch(setSocketConnection(socketConnection));
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const basePath = location.pathname === "/";
  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div
        className={`justify-center items-center flex-col gap-2 hidden ${
          !basePath ? "hidden" : "lg:flex"
        }`}
      >
        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/5962/5962463.png"
            width={60}
            alt="logo"
          />
        </div>
        <p className="text-lg mt-2 text-slate-500">
          Select user to send message
        </p>
      </div>
    </div>
  );
};

export default Home;
