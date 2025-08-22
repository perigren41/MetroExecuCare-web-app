import React, { useState } from "react";
import CircleButton from "./CircleButton";

export default function PasswordChangeCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white rounded-2xl pt-3 px-6 pb-3 flex flex-col 
      outline outline-2 outline-[#00539F] 
      shadow-lg shadow-[#00539F]/50">
      
      <h2 className="text-blue-900 text-sm font-semibold mb-4 sm:text-sm text-left">Change Password</h2>
      <div className="space-y-1 text-xs">

        {/* Current Password */}
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current Password"
            className="h-6 w-full border rounded-lg p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showCurrent ? (
              // Eye
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" strokeWidth={1.5} 
                stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 
                  7.51 7.355 4.5 12 4.5c4.646 0 8.578 3.01 
                  9.964 7.183.07.207.07.431 0 
                  .639C20.577 16.49 16.645 19.5 
                  12 19.5c-4.646 0-8.578-3.01-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 
                  016 0z" />
              </svg>
            ) : (
              // Eye-off
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" strokeWidth={1.5} 
                stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M3.98 8.223A10.477 10.477 0 001.934 
                  12C3.226 16.338 7.244 19.5 
                  12 19.5c.993 0 1.953-.138 
                  2.863-.395M6.228 6.228A10.451 
                  10.451 0 0112 4.5c4.756 0 
                  8.773 3.162 10.065 
                  7.498a10.522 10.522 0 01-4.293 
                  5.774M6.228 6.228 3 3m3.228 
                  3.228 3.65 3.65m7.894 
                  7.894L21 21m-3.228-3.228-3.65-3.65m0 
                  0a3 3 0 10-4.243-4.243m4.242 
                  4.242L9.88 9.88" />
              </svg>
            )}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            className="h-6 w-full border rounded-lg p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showNew ? (
              // Eye
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" strokeWidth={1.5} 
                stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 
                  7.51 7.355 4.5 12 4.5c4.646 0 8.578 3.01 
                  9.964 7.183.07.207.07.431 0 
                  .639C20.577 16.49 16.645 19.5 
                  12 19.5c-4.646 0-8.578-3.01-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 
                  016 0z" />
              </svg>
            ) : (
              // Eye-off
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" strokeWidth={1.5} 
                stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M3.98 8.223A10.477 10.477 0 001.934 
                  12C3.226 16.338 7.244 19.5 
                  12 19.5c.993 0 1.953-.138 
                  2.863-.395M6.228 6.228A10.451 
                  10.451 0 0112 4.5c4.756 0 
                  8.773 3.162 10.065 
                  7.498a10.522 10.522 0 01-4.293 
                  5.774M6.228 6.228 3 3m3.228 
                  3.228 3.65 3.65m7.894 
                  7.894L21 21m-3.228-3.228-3.65-3.65m0 
                  0a3 3 0 10-4.243-4.243m4.242 
                  4.242L9.88 9.88" />
              </svg>
            )}
          </button>
        </div>

        {/* Confirm New Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            className="h-6 w-full border rounded-lg p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? (
              // Eye
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" strokeWidth={1.5} 
                stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 
                  7.51 7.355 4.5 12 4.5c4.646 0 8.578 3.01 
                  9.964 7.183.07.207.07.431 0 
                  .639C20.577 16.49 16.645 19.5 
                  12 19.5c-4.646 0-8.578-3.01-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 
                  016 0z" />
              </svg>
            ) : (
              // Eye-off
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                viewBox="0 0 24 24" strokeWidth={1.5} 
                stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M3.98 8.223A10.477 10.477 0 001.934 
                  12C3.226 16.338 7.244 19.5 
                  12 19.5c.993 0 1.953-.138 
                  2.863-.395M6.228 6.228A10.451 
                  10.451 0 0112 4.5c4.756 0 
                  8.773 3.162 10.065 
                  7.498a10.522 10.522 0 01-4.293 
                  5.774M6.228 6.228 3 3m3.228 
                  3.228 3.65 3.65m7.894 
                  7.894L21 21m-3.228-3.228-3.65-3.65m0 
                  0a3 3 0 10-4.243-4.243m4.242 
                  4.242L9.88 9.88" />
              </svg>
            )}
          </button>
        </div>

        {/* Update Button */}
        <div className="flex justify-end gap-2 mt-2">
          <CircleButton text="Update" color="bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
