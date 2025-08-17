import React from "react";

export default function ProfileCard() {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
      <h2 className="text-blue-900 font-semibold mb-4">Basic Information</h2>
      <img
        src="https://i.pinimg.com/originals/8f/16/f9/8f16f9f71c7d6db2d75f49e63f7f2f38.jpg"
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-purple-400 mb-4 object-cover"
      />
      <p className="text-purple-700 font-bold text-xl">Thor Odinson</p>
      <p className="text-gray-600">Senior Executive Officer</p>
      <p className="text-gray-500 text-sm mb-4">
        Metrobank Fort - Ecoprime Tower
      </p>

      <div className="text-sm text-left w-full space-y-1">
        <p><strong>Employee ID:</strong> 00009</p>
        <p><strong>Email:</strong> odinson.thor@metrobank.com.ph</p>
        <p><strong>Contact:</strong> 09287327111</p>
        <p><strong>Birth Date:</strong> 1983-08-11</p>
        <p><strong>Department:</strong> Marketing</p>
      </div>

      <button className="mt-4 text-blue-600 hover:underline">Change Picture</button>
    </div>
  );
}
