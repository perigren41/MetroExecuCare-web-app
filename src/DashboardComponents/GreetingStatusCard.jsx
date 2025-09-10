export default function GreetingStatusCard({ name, status }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center mt-8 mb-6 md:mx-20">
      {/* Greeting Section */}
      <div>
        <div className="grid grid-flow-row md:grid-flow-col grid-rows-4 md:flex-row max-w-8xl gap-0 text-center md:text-left my-0">
          <div className="flex flex-col items-center md:items-start">
            <img
              src="src/assets/MetrobankLogo.svg"
              className="sm:w-35 h-8 md:w-40 md:h-10"
              alt="Metrobank Logo"
            />
          </div>
          <h1 className="text-4xl font-bold text-center md:text-left">
            Hello, {name}!
          </h1>
          <p className="sm:text-base md:text-xl text-center md:text-left">
            Welcome to the MetroExecuCare Annual Executive Check-up Portal
          </p>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-white text-gray-900 rounded-4xl shadow-lg w-100 h-70 mt-0 md:mt-0 text-center 
      flex flex-col justify-center mx-auto">
         {/* Inside Status Section */}
        <h2 className="text-2xl font-bold pb-5">Current LOA Status</h2>

        {/* Inside pending word Section */}
        <div
          className="font-bold rounded-full px-4 py-2 inline-flex items-center border mx-auto"
          style={status.pillStyle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-10 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{status.text}</span>
        </div>

        <p className="text-xs text-gray-500 mt-2">{status.note}</p>
      </div>
    </div>
  );
}
