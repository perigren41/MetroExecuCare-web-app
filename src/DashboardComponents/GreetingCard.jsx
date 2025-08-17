import React from "react";

export default function GreetingCard({ name }) {
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-4 md:flex-row max-w-8xl gap-2 transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0">
        <div className="flex flex-col items-center md:items-start">
          <img
            src="src/assets/MetrobankLogo.svg"
            className="w-45 h-10 md:w-40 md:h-10"
            alt="Metrobank Logo"
          />
        </div>
        <h1 className="text-4xl font-bold md:text-left ">Hello, {name}!</h1>
      <p className="text-xlmt-1">
        Welcome to the MetroExecuCare Annual Executive Check-up Portal
      </p>
      </div>
    </div>
  );
}
