import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// import { ThemeToggle } from "@/Components/ThemeToggle.jsx"
import { NavbarSection } from "@/Components/NavbarSection.jsx"
import metrobankicon from "@/assets/metrobank-icon.svg";
import mainLogo from "@/assets/mainLogo-foreground.svg";
import ProfileGray from "@/assets/profilegray.svg";
import EyeOpen from "@/assets/eyeopen.svg";
import EyeClose from "@/assets/eyeclose.svg";
import lockIcon from "@/assets/lockicon.svg";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname ||
        (user.role?.toLowerCase() === 'admin' ? '/admin-users-page' : '/executive-employee-dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Please enter your email address");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Navigation will be handled by the useEffect above
        const targetPath = location.state?.from?.pathname ||
          (result.user.role?.toLowerCase() === 'admin' ? '/admin-users-page' : '/executive-employee-dashboard');
        navigate(targetPath, { replace: true });
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);

      // Provide specific error messages based on error type
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setError("Unable to reach the server. The server may be down or unreachable. Please try again later or contact support.");
      } else if (error.message.includes('NetworkError') || error.message.includes('Network')) {
        setError("Network connectivity issue detected. Please check your internet connection and try again.");
      } else if (error.response && error.response.status >= 500) {
        setError("The server is currently unavailable. Please try again later or contact support.");
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden 
                    bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
                    dark:bg-[linear-gradient(to_right,#1a2332_2%,#0f1419_30%,#2a1f3d_50%,#3a2847_75%)]
                    transition-colors duration-300 px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Navbar always on top */}
      <NavbarSection />

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center opacity-20 dark:opacity-10
                   bg-[linear-gradient(to_right,#3F6EC0_20%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
                   dark:bg-[linear-gradient(to_right,#1a2332_20%,#0f1419_30%,#2a1f3d_50%,#3a2847_75%)]
                   transition-all duration-300"
        style={{
          backgroundImage: `url(${metrobankicon})`,
          backgroundSize: "clamp(300px, 50vw, 1200px)"
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
                      bg-transparent p-6 sm:p-8 md:p-10 rounded-2xl 
                      text-white dark:text-gray-100 transition-colors duration-300
                      mx-auto">
        {/* Logo + Heading */}
        <div className="text-left mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-0">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="ml-2">MetroExecuCare</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">Welcome to MetroExecuCare!</h2>
          <p className="text-sm text-gray-200 dark:text-gray-300 mt-2 transition-colors duration-300
                        leading-relaxed">
            Where health meets convenience. Sign in to get started with your Annual Executive Check-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email */}
          <div className="relative">
            <label className="block mb-1 text-sm text-left">Email Address</label>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 
                           h-10 sm:h-12 transition-colors duration-300">
              <span className="text-gray-500 dark:text-gray-400">
                <img
                  src={ProfileGray}
                  alt="Profile"
                  className="w-5 h-5 sm:w-6 sm:h-6 object-cover dark:filter dark:invert"
                />
              </span>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                className="flex-1 py-2 bg-transparent focus:outline-none 
                          text-gray-800 dark:text-gray-200 pl-1 text-sm sm:text-base
                          placeholder-gray-500 dark:placeholder-gray-400
                          transition-colors duration-300 border-0"
              />
            </div>
            {/* Custom validation message */}
            {emailError && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1
                              bg-red-500 dark:bg-red-600 text-white text-sm px-3 py-1
                              rounded-full shadow-lg z-10 transition-colors duration-300">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2
                               w-2 h-2 bg-red-500 dark:bg-red-600 rotate-45"></div>
                {emailError}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block mb-1 text-sm text-left">Password</label>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-3 
                           h-10 sm:h-12 transition-colors duration-300">
              <img src={lockIcon} alt="Lock Icon" className="w-5 h-5 sm:w-6 sm:h-6 dark:filter dark:invert" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                disabled={isLoading}
                className="flex-1 py-2 bg-transparent focus:outline-none 
                          text-gray-800 dark:text-gray-200 pl-1 text-sm sm:text-base
                          placeholder-gray-500 dark:placeholder-gray-400
                          transition-colors duration-300 border-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 dark:text-gray-400 justify-center"
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
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 bg-red-500 dark:bg-red-600 
              text-white text-sm px-3 py-1 rounded-full shadow-lg z-10 transition-colors duration-500">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 
              dark:bg-red-600 rotate-45"></div>
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
            disabled={isLoading}
            className="w-24 sm:w-28 md:w-30 lg:w-32 bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 
                      font-semibold py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base
                      hover:bg-green-300 dark:hover:bg-green-600 
                      transition-colors duration-300 mt-4 sm:mt-6
                      mx-auto block"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              'LOGIN'
            )}
          </button>
        </form>
      </div>

    </div>
  );
}