import React, { useState } from "react";
import GreetingStatusCard from "@/DashboardComponents/GreetingStatusCard.jsx";
import ActionButton from "@/DashboardComponents/ActionButton.jsx";

const COLORS = {
  ombre: ["#3F6EC0", "#00539F", "#5D3EA4", "#7940A8"],
  blue: "#00539F",
  purple: "#5D3EA4",
};

export default function ExecutiveEmployeeDashboard() {
  const [loaStatus, setLoaStatus] = useState({
    text: "Pending",
    note: "To be reviewed",
    pillStyle: {
      backgroundColor: "#FFF3BF",
      color: "#8D6B00",
      borderColor: "#E9CF7A",
    },
  });

  const requestApproval = () => {
    setLoaStatus({
      text: "Approval Requested",
      note: "Awaiting confirmation",
      pillStyle: {
        backgroundColor: "#DBECFF",
        color: COLORS.blue,
        borderColor: "#B3D6FF",
      },
    });
  };

  const requestAuthorization = () => {
    setLoaStatus({
      text: "Authorization Requested",
      note: "Awaiting confirmation",
      pillStyle: {
        backgroundColor: "#E9DBFF",
        color: COLORS.purple,
        borderColor: "#D1B9FF",
      },
    });
  };

  const handleClickUser = () => {
    console.log("User profile clicked");
  };

  return (
  <div className="bg-gray-100 min-h-screen font-segoe-ui">
    {/* Top Section */}
    <div
      className="relative text-white flex flex-col md:flex-row justify-between items-center shadow-2xl p-6 sm:p-8 sm:pr-30 sm:pl-30"
      style={{
        minHeight: "60vh", // 👈 instead of fixed height, use minHeight
        background: `linear-gradient(90deg, 
          ${COLORS.ombre[0]} 0%, 
          ${COLORS.ombre[1]} 25%, 
          ${COLORS.ombre[2]} 60%, 
          ${COLORS.ombre[3]} 100%)`,
      }}
    >
      {/* Left Side */}
      <GreetingStatusCard name="Thor" status={loaStatus} />

      {/* Top Right - Name + Circle Image */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 md:mr-16 sm:mr-4">
        {/* Still name on mobile, show on sm+ */}
        <span className="text-xs">Thor Odinson</span>
        <button
          className="w-8 h-8 rounded-full overflow-hidden border border-white"
          onClick={handleClickUser}
        >
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>

     {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center sm:space-x-[200px] my-10 px-4 sm:mb-8 
      space-y-4 sm:space-y-4 items-center sm:items-start">
        <ActionButton
          label="Request Letter of Approval"
          color={COLORS.blue}
          onClick={requestApproval}
        />
        <ActionButton
          label="Request Letter of Authorization"
          color={COLORS.purple}
          onClick={requestAuthorization}
        />
      </div>
      </div>
  );
}
