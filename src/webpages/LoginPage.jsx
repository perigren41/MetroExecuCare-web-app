import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/Components/ThemeToggle.jsx"
import { NavbarSection } from "@/Components/NavbarSection.jsx"
import { USERS_DATABASE } from "@/webpages/MockUsers.jsx";
import metrobankicon from "@/assets/metrobank-icon.svg";
import mainLogo from "@/assets/mainLogo-foreground.svg";
import ProfileGray from "@/assets/profilegray.svg";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import lockIcon from "@/assets/lockicon.svg";

export function LoginPage({ onLogin, setCurrentUser, setUsersData }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Find user in database
    const user = USERS_DATABASE.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Set the current logged-in user
      setCurrentUser?.(user);
      
      // Set the users data for admin pages
      setUsersData?.(USERS_DATABASE);
      
      // Call onLogin callback if provided
      onLogin?.(user);
      
      // Navigate based on user role
      if (user.role === "Admin" || user.branch === "Admin") {
        navigate("/admin-users-page");
      } else {
        navigate("/employee-dashboard"); // or wherever executives go
      }
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen relative overflow-hidden bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]">
      
      {/* Navbar always on top */}
      <NavbarSection />

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center opacity-20  bg-[linear-gradient(to_right,#3F6EC0_20%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]"
        style={{
          backgroundImage: `url(${metrobankicon})`,
          backgroundSize: "clamp(500px, 60vw, 1200px)"
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-200 bg-transparent p-10 rounded-2xl text-white">
        {/* Logo + Heading */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-0">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-10 h-10" />
            MetroExecuCare
          </h1>
          <h2 className="text-3xl font-bold mt-2">Welcome to MetroExecuCare!</h2>
          <p className="text-sm text-gray-200 mt-2">
            Where health meets convenience. Sign in to get started with your Annual Executive Check-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block mb-1 text-sm text-left">Username</label>
            <div className="flex items-center bg-white rounded-full px-3">
              <span className="text-gray-500">

                <img
                  src={ProfileGray}
                  alt="Profile"
                  className="w-6 h-6 object-cover"
                />

              </span>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 py-2 bg-transparent focus:outline-none text-gray-800"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-left">Password</label>
            <div className="flex items-center bg-white rounded-full px-3">
              <img src={lockIcon} alt="Lock Icon" className="w-6 h-6" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="flex-1 py-2 bg-transparent focus:outline-none text-gray-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500"
              >
                {showPassword ? (
              <img src={EyeOpen} alt="Hide password" className="size-5" />
              ) : (
                <img src={EyeClose} alt="Show password" className="size-5" />
              )}
            </button>
          </div>
        </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-300 text-sm text-center bg-red-500/20 py-2 px-4 rounded-full">
              {error}
            </div>
          )}


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