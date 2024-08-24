import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { REACT_APP_BACKEND_URL } from "../../env";
import toast from "react-hot-toast";
import axios from "axios";
import Avatar from "../components/Avatar";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/userSlice";

const CheckPassword = () => {
  const [data, setData] = useState({
    password: "",
    userId: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location?.state?.name) {
      navigate("/email");
    }
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const URL = `${REACT_APP_BACKEND_URL}/password`;

    try {
      setLoading(true);
      const response = await axios({
        method: "post",
        url: URL,
        data: {
          userId: location?.state?._id,
          password: data?.password,
        },
        withCredentials: true,
      });

      toast.success(response?.data?.message);
      if (response?.data?.success) {
        setLoading(false);
        dispatch(setToken(response?.data?.token));
        localStorage.setItem("token", response?.data?.token);
        setData({
          password: "",
        });
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error.response.data);
    }
  };

  return (
    <div className="mt-5">
      <div className="bg-white w-full max-w-md  rounded overflow-hidden p-4 mx-auto">
        <div className="w-fit mx-auto mb-2 flex justify-center items-center flex-col">
          <Avatar
            width={70}
            height={70}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic}
          />
          <h2 className="font-semibold text-lg mt-1">
            {location?.state?.name}
          </h2>
        </div>
        <form className="grid gap-4 mt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password :</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="enter your password"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.password}
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
            {loading ? 'Checking...':'Login'}
          </button>
        </form>
        {/* <p className='my-3 text-center'><Link to={"/forgot-password"} className='hover:text-primary font-semibold'>Forgot password ?</Link></p> */}
      </div>
    </div>
  );
};

export default CheckPassword;
