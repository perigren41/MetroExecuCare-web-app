import { NavbarSection } from "@/Components/NavbarSection.jsx"
import { HeroSection } from "@/Components/HeroSection.jsx"
import { FeaturesSection} from "@/Components/FeaturesSection.jsx"
import { HowItWorksSection } from "@/Components/HowItWorksSection.jsx"

export const LandingPage = () => {
    return(
        <div className="h-screen w-full snap-y snap-mandatory scroll-smooth">
            <NavbarSection />
            {/* Navbar */ }

            
            <section className="snap-start flex items-center justify-center scroll-smooth">
                
            <HeroSection />
            {/* Hero */ }
            
            </section>

            <section className="snap-start flex items-center justify-center scroll-smooth">

            <FeaturesSection />
            {/* Features */ }
            </section>
            
            <section className="snap-start flex items-center justify-center scroll-smooth">
            <HowItWorksSection />
            </section>
            {/* How it works */ }
            {/* Footer */ }
        </div>
        
    )
}