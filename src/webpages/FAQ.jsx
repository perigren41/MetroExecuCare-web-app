import { NavbarSection } from "@/Components/NavbarSection.jsx";
import { Footer } from "@/Components/Footer.jsx";

export const FAQ = () => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Navbar */}
      <NavbarSection />

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-28">
        <div className="w-full max-w-full md:max-w-[calc(100vw-364px)] px-4 md:px-0 mx-auto text-justify">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-secondary text-center mb-12">
            Here you'll find answers to common questions about MetroExecuCare.
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                What is MetroExecuCare?
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                MetroExecuCare is an online platform that makes it easier for
                Metrobank executive employees to request and track their annual
                executive check-ups. It is designed and developed by students of
                STI College Global City as their capstone project.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                What is an annual executive check-up?
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                An annual executive check-up is a complete health examination
                provided by Metrobank for its executive employees. It's a yearly
                benefit that helps make sure officers stay healthy by
                identifying any potential health issues early. The check-up
                usually includes lab tests, physical exams, and consultations
                with doctors. Executives can choose to go to an accredited
                hospital or request authorization to visit a non-accredited one.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                How do I request a check-up?
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                After logging in, simply go to your dashboard and click on
                either the "Request Letter of Approval" (for regular packages in
                accredited hospitals) or "Request Letter of Authorization" (for
                special requests in non-accredited hospitals) button. Fill out
                the form, submit it, and track it using the status tracker
                feature.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                How will I know if my request is approved?
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                You can track the status of your request anytime by logging into
                your account and checking the "LOA Status Tracker."
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                What should I do if I forgot my login details?
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                Please reach out to your HR department or system administrator
                for assistance.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-[#023184] mb-2">
                Is MetroExecuCare safe to use?
              </h2>
              <p className="text-base md:text-lg text-[#4E4E4E]">
                Yes. MetroExecCare is built with secure logins and access
                controls to keep your personal and medical information private.
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
