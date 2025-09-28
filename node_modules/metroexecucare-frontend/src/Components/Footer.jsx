export const Footer = () => {
  return (
    <footer className="w-full p-6 gradient-bg-border flex flex-col md:flex-row md:justify-between md:items-center mt-auto">
      {/* Left Side */}
      <div className="flex flex-col items-center md:items-start">
        <img
          src="src/assets/MetrobankLogo.svg"
          className="w-40 h-10"
          alt="Metrobank Logo"
        />
        <p className="text-md text-mainWhite font-thin pt-4 text-center md:text-left">
          MetroExecuCare, where health meets convenience.
        </p>
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-center md:items-end mt-4 md:mt-0">
        <p className="text-md font-thin text-mainWhite text-center md:text-right">
          © 2025 MetroExecuCare. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-2">
          <a href="/about" className="text-mainWhite hover:underline">About Us</a>
          <a href="/contact" className="text-mainWhite hover:underline">Contact Us</a>
          <a href="/faq" className="text-mainWhite hover:underline">FAQ</a>
        </div>
      </div>
    </footer>
  );
};
