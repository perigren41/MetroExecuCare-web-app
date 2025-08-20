import React from "react";

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="mb-4 relative">
      {/* Search Icon */}
      <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </span>

      {/* Input */}
      <input
        type="text"
        placeholder="Search by Name or Employee ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-80 h-6 pl-7 border border-gray-300 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
      />
    </div>
  );
}
