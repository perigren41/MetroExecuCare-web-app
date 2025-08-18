// src/components/SearchBar.jsx
import React from "react";

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search by Name or Employee ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
