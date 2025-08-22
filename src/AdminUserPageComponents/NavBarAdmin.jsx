import React from "react";
import metrobankicon from "@/assets/metrobank-icon.svg";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === "/admin-users-page") {
      // ✅ If already on adminpage → Logout
      navigate("/loginpage", { replace: true });
    } else {
      // ✅ If in admin subpage → go back to adminpage
      navigate("/admin-users-page");
    }
  };

  const handleClickUser = () => {
      navigate("/admin-profile-page");
  };
  return (
    <div
      className="relative flex items-center justify-between px-6 py-1 
      bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
      text-white"
    >
      {/* Left - Button with SVG */}
      <button className="w-5 h-5 flex items-center justify-center rounded-lg bg-white border border-white hover:bg-gray-100 transition" onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="#1e3a8a" /* dark blue stroke */
          fill="none"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
      </button>

    {/* Center - Logo + Text */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-base font-semibold flex items-center pr-4 gap-1">
          <img src={metrobankicon} alt="Metrobank Icon" className="w-5 h-5" />
          Metrobank
        </h1>
      </div>

      {/* Right - Name + Circle Image */}
      <div className="flex items-center space-x-1">
        <span className="text-xs">Thor Odinson</span>
        <button className="w-6 h-6 rounded-full overflow-hidden border border-white" onClick={handleClickUser}>
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