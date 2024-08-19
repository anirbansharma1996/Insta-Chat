import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { REACT_APP_BACKEND_URL } from "../../env";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const URL = `${REACT_APP_BACKEND_URL}/register`;

    try {
      const response = await axios.post(URL, data);
      //console.log(response)
      toast.success(response.data.message);
      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
        });
      }
      navigate("/email");
    } catch (error) {
      // console.log(error.message);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="m-auto mt-5 w-80">
      <div className="bg-white w-full mx-w-md rounded overflow-hidden p-4 mx- auto">
        <h3 className="text-center">Insta Chat</h3>
        <form className="grid gap-4 mt-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="enter your name"
              className="bg-slate-100 px-2 py-1"
              value={data.name}
              onChange={handleInput}
              required
            />
          </div>
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
          <button className="bg-blue-600 text-lg  px-4 py-1 hover:bg-blue-800 rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
            Register
          </button>
        </form>
        <p className="my-3 text-center">
          Already have account ?{" "}
          <Link to={"/email"} className="hover:text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
