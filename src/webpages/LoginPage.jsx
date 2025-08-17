import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for page navigation
import { ThemeToggle } from "@/Components/ThemeToggle.jsx"
import { NavbarSection } from "@/Components/NavbarSection.jsx"
import MetrobankLogo from "@/assets/MetrobankLogo.svg";
import mainLogo from "@/assets/mainLogo-foreground.svg";

export function LoginPage({ onLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

     if (username === "admin" && password === "1234") {
      onLogin?.(); // optional callback if you need it
      navigate("/executive-employee-dashboard"); // redirect to dashboard page
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden ">

      {/*Theme Toggle night and light mode*/}
      <ThemeToggle />
      {/* Navbar always on top */}
      <NavbarSection />

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${MetrobankLogo})` }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-200 bg-transparent p-10 rounded-2xl text-white">
        {/* Logo + Heading */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-8 h-10" />
            MetroExecuCare
          </h1>
          <h2 className="text-3xl font-bold mt-2">Welcome to MetroExecuCare!</h2>
          <p className="text-sm text-gray-200 mt-2">
            Where health meets convenience. Sign in to get started with your Annual Executive Check-up.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block mb-1 text-sm text-left">Username</label>
            <div className="flex items-center bg-white rounded-full px-3">
              <span className="text-gray-500 mr-2">👤</span>
              <input
                type="text"
                placeholder="Enter username"
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 py-2 bg-transparent focus:outline-none text-gray-800"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-left">Password</label>
            <div className="flex items-center bg-white rounded-full px-3">
              <span className="text-gray-500 mr-2">🔒</span>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="flex-1 py-2 bg-transparent focus:outline-none text-gray-800"
              />
              <button type="button" className="text-gray-500">👁️</button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-50 bg-white text-blue-700 font-semibold py-2 rounded-full hover:bg-blue-100 transition-colors"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
