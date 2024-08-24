import { Link, useNavigate } from "react-router-dom";
import { REACT_APP_BACKEND_URL } from "../../env";
import { PiUserCircle } from "react-icons/pi";
import Loading from "../components/Loading";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const CheckEmail = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
  });
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const URL = `${REACT_APP_BACKEND_URL}/email`;

    try {
      setLoading(true);
      const response = await axios.post(URL, data);
      toast.success(response.data.message);
      if (response.data.success) {
        setData({
          email: "",
        });
      }
      setLoading(false);
      navigate("/password", {
        state: response?.data.data,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="mt-5">
      <div className="bg-white w-full max-w-md  rounded overflow-hidden p-4 mx-auto">
        <div className="w-fit mx-auto mb-2">
          <PiUserCircle size={80} />
        </div>

        <h3>Welcome to Insta Chat !</h3>

        <form className="grid gap-4 mt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="enter your email"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.email}
              onChange={handleInput}
              required
            />
          </div>

          <button
            disabled={loading}
            className={`${
              loading ? "bg-slate-400" : "bg-blue-600"
            } text-lg  px-4 py-1 ${
              loading ? "hover:bg-slate-500" : "hover:bg-blue-800"
            } rounded mt-2 font-bold text-white leading-relaxed tracking-wide`}
          >
            {loading ? "Checking..." : "Let's Go"}
          </button>
        </form>

        <p className="my-3 text-center">
          New User ?{" "}
          <Link to={"/register"} className="hover:text-primary font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmail;
