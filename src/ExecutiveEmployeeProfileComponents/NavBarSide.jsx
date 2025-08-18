import React from "react";
import mainLogo from "@/assets/mainLogo-foreground.svg";

export default function Navbar() {
  return (
        <div className="flex items-center justify-between px-6 py-0 
      bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
      text-white"
    >
      {/* Left - Button with SVG */}
      <button className="w-7 h-7 p-1 rounded-full hover:bg-white/20 transition border-1 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" 
          fill="none" viewBox="0 0 24 24" 
          strokeWidth="1.5" stroke="currentColor" 
          className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </button>

        {/* Center - Logo */}
        <div className="flex justify-center">
        <h1 className="text-base font-semibold flex items-center gap-1">
        <img src={mainLogo} alt="MetroExecuCare Logo" className="w-8 h-9" />
        MetroExecuCare
        </h1>
</div>

      {/* Right - Name + Circle Image */}
      <div className="flex items-center space-x-1">
        <span className="text-xs">Thor Odinson</span>
        <button className="w-6 h-6 rounded-full overflow-hidden border-1 border-white">
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="w-4 h-4 object-cover"
          />
        </button>
      </div>
    </div>
  );
}
