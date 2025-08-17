import React, { useState } from "react";
import GreetingCard from "@/DashboardComponents/GreetingCard.jsx";
import StatusCard from "@/DashboardComponents/StatusCard.jsx";
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
  

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Top Section */}
      <div
        className="text-white flex flex-col md:flex-row justify-between items-center shadow-2xl p-8 pr-60 pl-60"
        style={{
          height: "60vh",
          background: `linear-gradient(90deg, 
            ${COLORS.ombre[0]} 0%, 
            ${COLORS.ombre[1]} 25%, 
            ${COLORS.ombre[2]} 60%, 
            ${COLORS.ombre[3]} 100%)`,
        }}
      >
        <GreetingCard name="Thor" />
        <StatusCard status={loaStatus} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-x-[200px] mt-10 px-4">
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
