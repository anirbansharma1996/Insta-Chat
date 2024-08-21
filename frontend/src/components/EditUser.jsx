import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Divider from "./Divider";
import axios from "axios";
import taost from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { REACT_APP_BACKEND_URL } from "../../env";
import CircularJSON from "circular-json";

const EditUserDetails = ({ onClose, user }) => {
  const tk = localStorage.getItem("token");
  const [data, setData] = useState({
    name: user?.user,
    profile_pic: user?.profile_pic,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    setData((preve) => {
      return {
        ...preve,
        ...user,
      };
    });
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const safeData = CircularJSON.stringify(data);
 
    try {
      const URL = `${REACT_APP_BACKEND_URL}/update-user/${tk}`;

      const response = await axios({
        method: "post",
        url: URL,
        data: JSON.parse(safeData),
        withCredentials: true,
      });

      taost.success(response?.data?.message);

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        onClose();
      }
    } catch (error) {
      console.log(error);
      taost.error("something went wrong");
    }
  };
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
      <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm">
        <h2 className="font-semibold">Profile Details</h2>
        <p className="text-sm ">Edit user details</p>

        <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={handleOnChange}
              className="w-full py-1 px-2 focus:outline-primary border-0.5"
            />
          </div>

          <Divider />
          <div className="flex gap-2 w-fit ml-auto ">
            <button
              onClick={onClose}
              className="border-primary border text-primary px-4 py-1 rounded hover:bg-red-600 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="border-primary bg-primary text-black border px-4 py-1 rounded hover:bg-green-600 hover:text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
