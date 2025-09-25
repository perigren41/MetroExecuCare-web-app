import React, { useState } from "react";
import SearchIcon from "@/assets/searchicon.svg";

export default function SearchBar({ search, setSearch, filter, setFilter, users }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="relative flex items-center gap-2 w-full">
      {/* Search Input */}
      <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 z-10">
        <img src={SearchIcon} alt="Search" className="w-3 h-3 sm:w-4 sm:h-4" />
      </span>
      <input
        type="text"
        placeholder="Search by Name or Employee ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-80 md:w-96 lg:w-[400px] h-7 pl-7 pr-2 rounded-gradient
                   focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
      />

      {/* Filters Button */}
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="h-7 px-2 sm:px-3 text-xs rounded-xl font-medium bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-900 whitespace-nowrap"
      >
        Filters
      </button>

      {/* Filters Box */}
      {showFilters && (
        <div className="absolute top-9 left-0 sm:left-40 lg:left-60 shadow-xl bg-white rounded-2xl w-full sm:w-70 max-w-xs z-50 border border-gray-200">
          <div className="flex justify-between items-center 
            bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
            text-white px-3 py-1 rounded-t-2xl">
            <h2 className="text-xs font-bold text-left">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-white hover:text-gray-200 text-sm"
            >
              ✖
            </button>
          </div>

          <p className="text-xs font-medium text-gray-600 mx-4 my-2 text-left">
            Employee Roles
          </p>

          {/* Filter Options */}
          {[
            { value: "all", label: "All" },
            { value: "admin", label: "Admin" },
            { value: "executive", label: "Executive" },
            { value: "hr_personnel", label: "Human Resource Personnel" },
            { value: "benefits_officer", label: "Benefits Officer" },
            { value: "welfare_head", label: "Division Head" }
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1"
            >
              <input
                type="radio"
                value={option.value}
                checked={filter === option.value}
                onChange={(e) => setFilter(e.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}

          {/* Confirm */}
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setShowFilters(false)}
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
