import React, { useState } from "react";
import SearchIcon from "@/assets/searchicon.svg";

export default function SearchBar({ search, setSearch, filter, setFilter, users }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="relative flex items-center gap-2 w-full">
      {/* Search Input with Gradient Border */}
      <div className="relative w-full sm:w-80 md:w-96 lg:w-[400px] h-[38px]">
        <div
          className="absolute inset-0 rounded-full p-[2px]"
          style={{
            background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
          }}
        >
          <div className="w-full h-full bg-white rounded-full flex items-center px-4">
            <img
              src={SearchIcon}
              alt="Search"
              className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search by Name or Employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-full border-0 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Filters Button */}
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="h-7 px-2 sm:px-3 text-xs rounded-xl font-medium bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-900 whitespace-nowrap cursor-pointer"
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
