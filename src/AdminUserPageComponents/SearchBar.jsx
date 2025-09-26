import React, { useState } from "react";
import SearchIcon from "@/assets/searchicon.svg";

export default function SearchBar({ search, setSearch, filter, setFilter }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="relative flex items-center gap-2 w-full">
      {/* Search Input - Responsive */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 z-10">
          <img src={SearchIcon} alt="Search" className="w-3 h-3 sm:w-4 sm:h-4" />
        </span>
        <input
          type="text"
          placeholder="Search by Name or Employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-7 sm:h-8 md:h-9 pl-6 sm:pl-7 pr-3 rounded-gradient 
                     focus:outline-none focus:ring-2 focus:ring-blue-900 
                     text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
        />
      </div>

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
        <div className="absolute top-9 left-5 sm:left-129 shadow-xl/30 bg-white rounded-2xl w-70 sm:w-70 z-50">
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
          {["all", "Admin", "Senior Executive Officer", "Benefits Assistant", "Benefits Services Officer", "Division Head"].map((role) => (
            <label
              key={role}
              className="flex items-center space-x-2 text-xs text-gray-700 mx-4 my-1"
            >
              <input
                type="radio"
                value={role}
                checked={filter === role}
                onChange={(e) => setFilter(e.target.value)}
              />
              <span>{role === "all" ? "All" : role}</span>
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