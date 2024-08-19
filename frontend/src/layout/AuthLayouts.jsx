import React from "react";

const AuthLayouts = ({ children }) => {
  return (
    <>
      <header className="flex justify-center items-center py-3 h-20 shadow-md bg-white">
        <img
          src="https://cdn-icons-png.flaticon.com/512/5962/5962463.png"
          alt="logo"
          width={60}
          height={60}
        />
      </header>
      {children}
    </>
  );
};

export default AuthLayouts;
