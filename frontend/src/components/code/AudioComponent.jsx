import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export const AudioComponent = ({
    handleUploadImageVideoOpen,
    openImageVideoUpload,
  }) => {
    return (
      <button
        onClick={handleUploadImageVideoOpen}
        className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-grey"
      >
        {openImageVideoUpload ? <RxCross2 size={26} /> : <FaPlus size={20} />}
      </button>
    );
  };