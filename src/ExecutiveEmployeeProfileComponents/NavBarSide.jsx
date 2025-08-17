import React from "react";
import mainLogo from "@/assets/mainLogo-foreground.svg";

export default function Navbar() {
  return (
        <div
  className="flex items-center justify-between px-6 py-2 
  bg-gradient-to-r from-[#3F6EC0] via-[#00539F] via-33% via-[#5D3EA4] to-[#7940A8] text-white"
>
      {/* Left - Button with SVG */}
      <button className="p-2 rounded-full hover:bg-white/20 transition ">
        <svg xmlns="http://www.w3.org/2000/svg" 
          fill="none" viewBox="0 0 24 24" 
          strokeWidth="1.5" stroke="currentColor" 
          className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </button>

        {/* Center - Logo */}
    <div className="flex justify-center">
  <h1 className="text-lg font-semibold flex items-center gap-2">
    <img src={mainLogo} alt="MetroExecuCare Logo" className="w-8 h-10" />
    MetroExecuCare
  </h1>
</div>

      {/* Right - Name + Circle Image */}
      <div className="flex items-center space-x-2">
        <span className="font-medium">Name</span>
        <button className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}
