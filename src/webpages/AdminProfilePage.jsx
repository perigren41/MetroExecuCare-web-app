import React from "react";
import ProfileCard from "@/ExecutiveEmployeeProfileComponents/ProfileCard";
import SummaryCard from "@/ExecutiveEmployeeProfileComponents/SummaryCard";
import PasswordChangeCard from "@/ExecutiveEmployeeProfileComponents/PasswordChangeCard";
import NavBarAdmin from "@/AdminUserPageComponents/NavBarAdmin";

export default function AdminProfilePage() {
  return (
    <>
      <NavBarAdmin />
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900">
        Admin Profile
      </h1>
      <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-4 md:px-8 {COLORS}">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4">
          
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
