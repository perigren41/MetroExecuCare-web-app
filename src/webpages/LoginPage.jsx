import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for page navigation
import { ThemeToggle } from "@/Components/ThemeToggle.jsx"
import { NavbarSection } from "@/Components/NavbarSection.jsx"
import metrobankicon from "@/assets/metrobank-icon.svg";
import mainLogo from "@/assets/mainLogo-foreground.svg";

export function LoginPage({ onLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex items-center justify-center h-screen relative overflow-hidden bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]">

     
      {/* Navbar always on top */}
      <NavbarSection />

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center opacity-20   bg-[linear-gradient(to_right,#3F6EC0_20%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]"
        style={{
          backgroundImage: `url(${metrobankicon})`,
          // backgroundSize: "1200px", // you can adjust size (px, %, cover, contain)
          backgroundSize: "clamp(500px, 60vw, 1200px)"
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-200 bg-transparent p-10 rounded-2xl text-white">
        {/* Logo + Heading */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-10 h-10" />
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
      type={showPassword ? "text" : "password"}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter password"
      className="flex-1 py-2 bg-transparent focus:outline-none text-gray-800"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-gray-500"
    >
      {showPassword ? (
        // Eye Slash (hidden)
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 
          0 1 0-.639C3.423 7.51 7.36 
          4.5 12 4.5c4.638 0 8.573 
          3.007 9.963 7.178.07.207.07.431 
          0 .639C20.577 16.49 16.64 
          19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 
          1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ) : (
        // Eye (visible)
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 
          19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 
          4.5c4.756 0 8.773 3.162 10.065 
          7.498a10.522 10.522 0 0 1-4.293 
          5.774M6.228 6.228 3 3m3.228 3.228 
          3.65 3.65m7.894 7.894L21 
          21m-3.228-3.228-3.65-3.65m0 
          0a3 3 0 1 0-4.243-4.243m4.242 
          4.242L9.88 9.88" />
        
        </svg>
      )}
    </button>
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
