import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../Avatar";
import { FaAngleLeft } from "react-icons/fa6";
import { MdOutlineBlock } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { HiDotsVertical } from "react-icons/hi";
import { CgUnblock } from "react-icons/cg";
import { FaVideo } from "react-icons/fa";

const Header = ({
  user,
  dataUser,
  isTyping,
  handleBlockFn,
  handleUnblockFn,
  handleBlockUnblockUser,
  blockModal,
}) => {
  return (
    <header className="sticky z-40 top-0 h-16 bg-white flex justify-between items-center px-4">
      <div className="flex items-center gap-4">
        <Link to={"/"} className="lg:hidden">
          <FaAngleLeft size={25} />
        </Link>
        <div>
          {user?.blockedBy.includes(dataUser._id) ? (
            <img
              width={50}
              height={50}
              className="rounded-full"
              src="https://i.pinimg.com/originals/87/14/55/8714556a52021ba3a55c8e7a3547d28c.png"
              alt="blocked"
            />
          ) : (
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
            {dataUser?.name}
          </h3>
          <p className="-my-2 text-sm">
            {!isTyping && dataUser.online ? (
              <span className="text-primary">
                {user?.blockedUsers.includes(dataUser._id) ||
                user?.blockedBy.includes(dataUser._id)
                  ? ""
                  : "online"}
              </span>
            ) : isTyping ? (
              <span className="text-slate-400">
                {user?.blockedUsers.includes(dataUser._id) ||
                user?.blockedBy.includes(dataUser._id)
                  ? ""
                  : "typing..."}
              </span>
            ) : (
              <span className="text-slate-400"></span>
            )}
          </p>
        </div>
      </div>
      <div className=" flex justify-between items-center relative">
        <button onClick={()=> alert('lAUNCHING SOON !!')}>
          <FaVideo size={20} />
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          onClick={handleBlockUnblockUser}
          className="cursor-pointer hover:text-primary"
        >
          {!blockModal ? <HiDotsVertical /> : <RxCross2 size={24} />}
        </button>
        {/* block  and unblock user */}
        {blockModal && (
          <div className="absolute rounded bg-gray-100 mb-1 top-7 -right-2 w-36 p-2 ease-in">
            <form>
              {user.blockedUsers.includes(dataUser._id) ? (
                <label
                  onClick={() => handleUnblockFn(dataUser?._id, user._id)}
                  className="flex items-center p-2 px-3 gap-3 hover:bg-gray-300 cursor-pointer"
                >
                  <div className="text-primary">
                    <CgUnblock size={28} />
                  </div>
                  <p>Unblock</p>
                </label>
              ) : (
                <label
                  onClick={() => handleBlockFn(dataUser?._id)}
                  className="flex items-center p-2 px-3 gap-3 hover:bg-gray-300 cursor-pointer"
                >
                  <div className="text-primary">
                    <MdOutlineBlock size={20} />
                  </div>
                  <p>Block</p>
                </label>
              )}
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
