import React from "react";

export default function CircleButton({ text, color }) {
  return (
    <button
      className={`${color} text-white px-4 py-2 rounded-full hover:opacity-80 transition`}
    >
      {text}
    </button>
  );
}
