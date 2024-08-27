import React from "react";

const Features = () => {
  const featuresList = [
    "Text to a random person",
    "Send photo",
    "Take selfie",
    "Send voice note",
    "Block user",
    "Reply to a text",
    "Edit a text",
    "Delete a text",
    "Reply with AI",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 flex flex-col items-center py-10">
      <div className="flex items-center justify-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/5962/5962463.png"
          alt="logo"
          className="w-14 -mt-4 mr-2"
        />
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Insta Chat Features
        </h1>
      </div>
      <ul className="bg-white shadow-lg rounded-lg w-full max-w-md p-6 space-y-4">
        {featuresList.map((feature, index) => (
          <li
            key={index}
            className="flex items-center text-lg text-gray-800 p-3 bg-blue-50 rounded-lg shadow-md hover:bg-blue-100 transition-colors"
          >
            <span className="mr-3 text-blue-500">{index + 1}.</span> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Features;
