// AboutUs.jsx
import { NavbarSection } from "@/Components/NavbarSection.jsx";
import { Footer } from "@/Components/Footer.jsx";

export const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarSection />
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-600">
          About Us content coming soon...
        </h1>
      </main>
      <Footer />
    </div>
  );
};
