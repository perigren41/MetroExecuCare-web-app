import React from "react";
import CircleButton from "./CircleButton";

export default function PasswordChangeCard() {
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col 
    outline outline-2 outline-[#00539F] 
    shadow-lg shadow-[#00539F]/50">
      
      <h2 className="text-blue-900 font-semibold mb-4">Change Password</h2>
      <div className="space-y-3">
        <input
          type="password"
          placeholder="Current Password"
          className="w-full border rounded-lg p-2"
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded-lg p-2"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border rounded-lg p-2"
        />
        <CircleButton text="Update" color="bg-blue-600" />
      </div>
    </div>
  );
}
