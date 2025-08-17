import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#3F6EC0] via-[#00539F] via-[#5D3EA4] to-[#7940A8]">
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#3F6EC0] via-[#5D3EA4] to-[#7940A8] shadow-2xl w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
            Welcome Back
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5D3EA4] focus:ring-2 focus:ring-[#3F6EC0] outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5D3EA4] focus:ring-2 focus:ring-[#3F6EC0] outline-none transition"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3F6EC0] via-[#00539F] to-[#7940A8] text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="#" className="text-[#5D3EA4] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
