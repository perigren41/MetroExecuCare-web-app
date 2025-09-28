import { NavbarSection } from "@/Components/NavbarSection.jsx";
import { Footer } from "@/Components/Footer.jsx";

export const AboutUs = () => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Navbar */}
      <NavbarSection />

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-28">
        <div className="w-full max-w-full md:max-w-[calc(100vw-364px)] px-4 md:px-0 mx-auto text-justify pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
            About Us
          </h1>
          <p className="text-secondary text-center mb-12">
            Learn more about MetroExecCare and what we do.
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                Who We Are
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                MetroExecCare is a secure, web-based platform designed to
                simplify and streamline the annual executive check-up process
                for senior officers of Metrobank. It was designed and developed
                by students of STI College Global City as their capstone project.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                What We Do
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                By automating requests, approvals, and documentation, MetroExecCare
                helps reduce the time and effort required to manage medical benefit
                availments. Our platform provides role-based dashboards for senior
                officers, HR personnel, benefits staff, and approvers—ensuring
                transparency, efficiency, and accuracy at every stage.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                Our Goal
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                We’re committed to improving the experience of both employees and
                administrators. Our goal is to make healthcare benefit management
                faster, clearer, and more reliable—so senior officers can focus on
                what matters most.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
