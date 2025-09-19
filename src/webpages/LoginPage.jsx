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
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userToLogin, setUserToLogin] = useState(null);

  const validateForm = () => {
    let isValid = true;
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Please fill out this field");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Please fill out this field");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    // Find user in database
    const user = USERS_DATABASE.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Show confirmation modal instead of logging in immediately
      setUserToLogin(user);
      setShowLoginModal(true);
    } else {
      setError("Invalid username or password");
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const confirmLogin = () => {
    if (userToLogin) {
      setCurrentUser?.(userToLogin);
      setUsersData?.(USERS_DATABASE);
      onLogin?.(userToLogin);
      
      if (userToLogin.role === "Admin" || userToLogin.branch === "Admin") {
        navigate("/admin-users-page");
      } else {
        navigate("/employee-dashboard");
      }
    }
  };

  const cancelLogin = () => {
    setShowLoginModal(false);
    setUserToLogin(null);
  };

  return (
    <div className="flex items-center justify-center h-screen relative overflow-hidden 
                    bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
                    dark:bg-[linear-gradient(to_right,#1a2332_2%,#0f1419_30%,#2a1f3d_50%,#3a2847_75%)]
                    transition-colors duration-300">
      
      {/* Navbar always on top */}
      <NavbarSection />
      
      {/* Theme Toggle - Higher z-index to ensure it's clickable */}
      <div className="fixed top-5 right-5 z-[60]">
        <ThemeToggle />
      </div>

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center opacity-20 dark:opacity-10
                   bg-[linear-gradient(to_right,#3F6EC0_20%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
                   dark:bg-[linear-gradient(to_right,#1a2332_20%,#0f1419_30%,#2a1f3d_50%,#3a2847_75%)]
                   transition-all duration-300"
        style={{
          backgroundImage: `url(${metrobankicon})`,
          backgroundSize: "clamp(500px, 60vw, 1200px)"
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-150 max-w-200 bg-transparent p-10 rounded-2xl 
                      text-white dark:text-gray-100 transition-colors duration-300">
        {/* Logo + Heading */}
        <div className="text-left mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-0">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-10 h-10" />
            MetroExecuCare
          </h1>
          <h2 className="text-3xl font-bold mt-2">Welcome to MetroExecuCare!</h2>
          <p className="text-sm text-gray-200 dark:text-gray-300 mt-2 transition-colors duration-300">
            Where health meets convenience. Sign in to get started with your Annual Executive Check-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Username */}
          <div className="relative">
            <label className="block mb-1 text-sm text-left">Username</label>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 transition-colors duration-300">
              <span className="text-gray-500 dark:text-gray-400">
                <img
                  src={ProfileGray}
                  alt="Profile"
                  className="w-6 h-6 object-cover dark:filter dark:invert"
                />
              </span>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={handleUsernameChange}
                className="flex-1 py-2 bg-transparent focus:outline-none 
                          text-gray-800 dark:text-gray-200 pl-1 
                          placeholder-gray-500 dark:placeholder-gray-400
                          transition-colors duration-300"
              />
            </div>
            {/* Custom validation message */}
            {usernameError && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 
                              bg-red-500 dark:bg-red-600 text-white text-sm px-3 py-1 
                              rounded-full shadow-lg z-10 transition-colors duration-300">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                               w-2 h-2 bg-red-500 dark:bg-red-600 rotate-45"></div>
                {usernameError}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block mb-1 text-sm text-left">Password</label>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 transition-colors duration-300">
              <img src={lockIcon} alt="Lock Icon" className="w-6 h-6 dark:filter dark:invert" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
                className="flex-1 py-2 bg-transparent focus:outline-none 
                          text-gray-800 dark:text-gray-200 pl-1 
                          placeholder-gray-500 dark:placeholder-gray-400
                          transition-colors duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 dark:text-gray-400"
              >
                {showPassword ? (
                  <img src={EyeOpen} alt="Hide password" className="size-5 dark:filter dark:invert" />
                ) : (
                  <img src={EyeClose} alt="Show password" className="size-5 dark:filter dark:invert" />
                )}
              </button>
            </div>
            {/* Custom validation message */}
            {passwordError && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 
                              bg-red-500 dark:bg-red-600 text-white text-sm px-3 py-1 
                              rounded-full shadow-lg z-10 transition-colors duration-300">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                               w-2 h-2 bg-red-500 dark:bg-red-600 rotate-45"></div>
                {passwordError}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-300 dark:text-red-200 text-sm text-center 
                           bg-red-500/20 dark:bg-red-600/20 py-2 px-4 rounded-full
                           transition-colors duration-300">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-30 bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 
                      font-semibold py-2 rounded-full 
                      hover:bg-green-300 dark:hover:bg-green-600 
                      transition-colors duration-300 mt-4"
          >
            LOGIN
          </button>
        </form>
      </div>

      {/* Login Confirmation Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm 
                       flex items-center justify-center z-50 transition-colors duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-100 max-w-200 mx-2 
                         overflow-hidden transition-colors duration-300">
            <div className="bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
                           dark:bg-[linear-gradient(to_right,#1a2332_2%,#0f1419_30%,#2a1f3d_50%,#3a2847_75%)]
                           flex items-center justify-between text-white px-4 py-2
                           transition-colors duration-300">
              <h3 className="text-base font-semibold">Confirm Login</h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Are you sure you want to login as{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {userToLogin?.username}
                  </span>
                  ?
                </p>
              </div>
              <div className="flex gap-3 justify-center text-sm">
                <button
                  onClick={cancelLogin}
                  className="px-4 py-1 bg-gray-200 dark:bg-gray-600 
                            text-gray-700 dark:text-gray-200 rounded-full font-medium 
                            hover:bg-gray-300 dark:hover:bg-gray-500 
                            transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogin}
                  className="px-4 py-1 bg-green-600 dark:bg-green-700 text-white 
                            rounded-full font-medium hover:opacity-90 
                            transition-all duration-300"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}