import React from "react";
import ProfileCard from "@/ExecutiveEmployeeProfileComponents/ProfileCard";
import SummaryCard from "@/ExecutiveEmployeeProfileComponents/SummaryCard";
import PasswordChangeCard from "@/ExecutiveEmployeeProfileComponents/PasswordChangeCard";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";



export default function ExecutiveEmployeeProfile() {
  return (

    <><NavBarSide />
      <h1 className="text-center text-base font-bold mb-2 pt-2 text-blue-900">Executive Employee Profile</h1>
    <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-4 md:px-8 {COLORS}">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
  {/* Profile top-left */}
  <div>
    <ProfileCard />
  </div>

  {/* Summary right side, spanning 2 rows */}
  <div className="lg:row-span-2">
    <SummaryCard />
  </div>

  {/* Password bottom-left */}
  <div>
    <PasswordChangeCard />
  </div>
</div>
</div>
    </>
  );
}
