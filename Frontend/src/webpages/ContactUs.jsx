import { NavbarSection } from "@/Components/NavbarSection.jsx";
import { Footer } from "@/Components/Footer.jsx";
import { Mail, Phone, Clock, MapPin } from 'lucide-react';

export const ContactUs = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "support@metroexeccare.com",
      subtitle: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+63 2 1234 5678",
      subtitle: "Call us during business hours"
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: "Monday – Friday",
      subtitle: "9:00 AM – 5:00 PM (PHT)"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Metro Manila, Philippines",
      subtitle: "Serving the greater Manila area"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Navbar */}
      <NavbarSection />

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-28">
        <div className="w-full max-w-full md:max-w-[calc(100vw-364px)] px-4 md:px-0 mx-auto">

          {/* Header Section */}
          <div className="text-center mb-16 pb-8 pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Contact Us
            </h1>
            <p className="text-secondary text-center mb-12">
              Have questions or need help? We're here to assist you every step of the way.
              Reach out to us through any of the channels below.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#023184]/20"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#023184] rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h2>
                  <p className="text-[#023184] font-semibold text-lg mb-2">
                    {item.content}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};