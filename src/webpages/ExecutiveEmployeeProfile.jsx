import React from "react";
import ProfileCard from "@/ExecutiveEmployeeProfileComponents/ProfileCard";
import SummaryCard from "@/ExecutiveEmployeeProfileComponents/SummaryCard";
import PasswordChangeCard from "@/ExecutiveEmployeeProfileComponents/PasswordChangeCard";
import NotesCard from "@/ExecutiveEmployeeProfileComponents/NotesCard";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";



export default function ExecutiveEmployeeProfile() {
  return (

    <><NavBarSide />
    
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 {COLORS}">
      <h1 className="text-center text-xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard />
        <SummaryCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <PasswordChangeCard />
        <NotesCard />
      </div>
    </div></>
  );
}
