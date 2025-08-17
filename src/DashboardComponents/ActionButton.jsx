import React from "react";

export default function ActionButton({ label, color, onClick }) {
  return (
    <button
      className="text-white font-semibold py-8 rounded-4xl w-100 h-40 shadow-md flex items-center justify-center space-x-3 transition transform active:scale-[.98]"
      style={{ backgroundColor: color }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-2-8h.01M4 6h16v12H4z" />
      </svg>
      <span className="text-lg">{label}</span>
    </button>
  );
}
