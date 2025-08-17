import React from "react";

export default function ProfileButton({ name, imageSrc, link }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition fixed top-4 right-4 z-50 bg-white shadow-md">
      <span className="font-medium text-gray-800">{name}</span>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={imageSrc}
          alt={name}
          className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition"
        />
      </a>
    </div>
  );
}
