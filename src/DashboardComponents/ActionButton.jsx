import React from "react";

export default function ActionButton({ label, color, onClick }) {
  return (
    <button
      className="text-white font-semibold py-4 rounded-4xl sm:h-20 w-100 md:h-40 shadow-md flex items-center 
      justify-center space-x-3 transition transform active:scale-[.98] mb-4"
      style={{ backgroundColor: color }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <span className="text-lg">{label}</span>
    </button>
  );
}
