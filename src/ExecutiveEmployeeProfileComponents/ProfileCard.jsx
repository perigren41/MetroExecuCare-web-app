import React from "react";

export default function ProfileCard() {
  return (
    <div className="bg-white rounded-2xl p-6 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50 w-full max-w-3xl mx-auto">
      
      {/* Title */}
      <h2 className="text-blue-900 font-semibold mb-4 px-2 sm:px-5 text-left text-lg sm:text-xl">
        Basic Information
      </h2>

      {/* Picture + Info */}
      <div className="flex flex-col md:flex-row justify-center md:justify-start items-center md:items-start gap-8 sm:gap-12">
        
        {/* Profile Image + Button */}
        <div className="flex flex-col items-center">
          <img
            src="https://i.pinimg.com/originals/8f/16/f9/8f16f9f71c7d6db2d75f49e63f7f2f38.jpg"
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-2 border-purple-400 object-cover"
          />

          {/* Action Button with Icon */}
          <button className="mt-3 flex items-center gap-2 text-blue-600 hover:underline text-sm sm:text-base">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            Change Picture
          </button>
        </div>

        {/* Employee Info */}
        <div className="flex flex-col text-center md:text-left px-2 sm:px-6 space-y-1">
          <p className="text-purple-700 font-bold text-lg sm:text-xl">Thor Odinson</p>
          <p className="text-gray-600 text-sm sm:text-base">Senior Executive Officer</p>
          <p className="text-gray-500 text-xs sm:text-sm mb-2">
            Metrobank Fort - Ecoprime Tower
          </p>

          <div className="text-xs sm:text-sm space-y-2">
            <p><strong>Employee ID:</strong> <br/>00009</p>
            <p><strong>Email:</strong> <br/>odinson.thor@metrobank.com.ph</p>
            <p><strong>Contact:</strong> <br/>09287327111</p>
            <p><strong>Birth Date:</strong> <br/>1983-08-11</p>
            <p><strong>Department:</strong> <br/> Marketing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
