import React from "react";

export default function StatusCard({ status }) {
  return (
    
    
    <div className=" bg-white text-gray-900 p-8 rounded-4xl shadow-lg w-110 h-70 mt-6 md:mt-0 text-center flex flex-col justify-center">
      <h2 className="text-2xl font-bold pb-5">Current LOA Status</h2>
      
      <div
        className="font-bold rounded-full px-4 py-3 inline-flex items-center border mx-auto"
        style={status.pillStyle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-15 mr-4"
        >
          <path
            fillRule="evenodd"
            d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z"
            clipRule="evenodd"
          />
        </svg>
        <span>{status.text}</span>
      </div>

      <p className="text-xs text-gray-500 mt-2">{status.note}</p>
    </div>
  );
}

