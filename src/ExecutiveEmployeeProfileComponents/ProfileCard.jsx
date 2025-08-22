import React, { useState } from "react";

export default function ProfileCard() {
  const [profileImage, setProfileImage] = useState(
    "https://i.pinimg.com/originals/8f/16/f9/8f16f9f71c7d6db2d75f49e63f7f2f38.jpg"
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl pt-3 pb-6 px-6 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50">
      
      {/* Title */}
      <h2 className="text-blue-900 font-semibold mb-4 text-left text-base sm:text-base">
        Basic Information
      </h2>

      {/* Picture + Info */}
      <div className="flex flex-col md:flex-row md:justify-start items-center md:items-center pb-4 px-4 sm:gap-8 gap-4">

        {/* Profile Image + Button */}
        <div className="flex flex-col md:justify-center items-center pl-0">
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            id="profileImageInput"
            className="hidden"
            onChange={handleImageChange}
          />

          {/* Profile Image */}
          <img
            src={profileImage}
            alt=""
            className="w-50 h-50 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-1 border-purple-400 object-cover"
          />

          {/* Action Button with Icon */}
          <button
            onClick={() => document.getElementById("profileImageInput").click()}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:underline text-sm sm:text-base"
          >
            Change Picture
          </button>
        </div>

        {/* Employee Info */}
        <div className="flex flex-col text-center md:text-left px-8 sm:px-8 space-y-0 pt-0">
          <p className="text-blue-700 font-bold text-2xl sm:text-2xl">Thor Odinson</p> 
          <p className="text-gray-600 text-sm sm:text-xs">Senior Executive Officer</p>
          <p className="text-gray-500 text-xs sm:text-xs mb-2">
            Metrobank Fort - Ecoprime Tower
          </p>

          <div className="sm:text-sm space-y-2">
            <p>
              <span className="font-bold text-blue-600 text-sm">Employee ID:</span><br />
              <span className="text-black text-xs">00009</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Email:</span><br />
              <span className="text-black text-xs">odinson.thor@metrobank.com.ph</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Contact:</span><br />
              <span className="text-black text-xs">09287327111</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Birth Date:</span><br />
              <span className="text-black text-xs">1983-08-11</span>
            </p>
            <p>
              <span className="font-bold text-blue-600 text-sm">Department:</span><br />
              <span className="text-black text-xs">Marketing</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
