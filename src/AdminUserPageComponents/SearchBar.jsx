import React, { useState } from "react";

export default function SearchBar({ search, setSearch }) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="relative flex items-center gap-2">
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
        className="w-80 h-7 pl-7 rounded-gradient 
                   focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
      />

      {/* Filters Button */}
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="h-7 px-3 text-xs rounded-xl font-medium bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-900"
      >
        Filters
      </button>

      {/* Filters Box */}
      {showFilters && (
        <div className="absolute top-9 left-40 shadow-xl/30 sm:left-81 bg-white rounded-xl w-70 sm:w-70 z-50">
        {/* Header */}
              <div className="flex justify-between items-center 
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
            text-white px-3 py-1 rounded-t-lg">
          <h2 className="text-xs font-bold text-left">Filters</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="text-white hover:text-gray-200 text-sm"
          >
            ✖
          </button>
    </div>
          <p className="text-xs font-medium text-gray-600 mx-4 my-2 text-left">Employee Position</p>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="all"
              checked={selectedFilter === "all"}
              onChange={() => setSelectedFilter("all")}
            />
            <span>All</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="name"
              checked={selectedFilter === "name"}
              onChange={() => setSelectedFilter("name")}
            />
            <span>Admin</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="executive"
              checked={selectedFilter === "executive"}
              onChange={() => setSelectedFilter("executive")}
            />
            <span>Executive Employee</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="seniorexecutiveofficer"
              checked={selectedFilter === "seniorexecutiveofficer"}
              onChange={() => setSelectedFilter("seniorexecutiveofficer")}
            />
            <span>Senior Executive Officer</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="benefitassistant"
              checked={selectedFilter === "benefitassistant"}
              onChange={() => setSelectedFilter("benefitassistant")}
            />
            <span>Benefits Assistant</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="benefitsservicesofficer"
              checked={selectedFilter === "benefitsservicesofficer"}
              onChange={() => setSelectedFilter("benefitsservicesofficer")}
            />
            <span>Benefits Services Officer</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1">
            <input
              type="radio"
              value="divisionhead"
              checked={selectedFilter === "divisionhead"}
              onChange={() => setSelectedFilter("divisionhead")}
            />
            <span>Division Head</span>
          </label>

          {/* Confirm Button */}
      <div className="flex justify-end mt-3">
        <button
          onClick={() => {
            // Handle confirm logic here
            setShowFilters(false);
          }}
          className="px-1 py-1 w-15 h-7 rounded-full bg-blue-700 text-white text-center text-xs hover:bg-blue-800 mx-4 mt-1 mb-3"
        >
          Confirm
        </button>
      </div>
        </div>
      )}
    </div>
  );
}
