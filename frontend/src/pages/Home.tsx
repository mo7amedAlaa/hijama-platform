 import Layout from "../components/ui/layout"
import HeroSection from "../components/Herosection"
import ServicesSection from "../components/ServicesSection"
import WhyUsSection from "../components/WhyUsSection"
import TestimonialsSection from "../components/TestimonialsSection"
import FAQSection from "../components/FAQSection"
import CTASection from "../components/CTASection"
import ConsultationSection from "../components/ConsultationSection"
function Home () {
  return (
    <Layout>   
    <HeroSection />
    <ServicesSection />
 
    <WhyUsSection />
    <TestimonialsSection />
    <FAQSection />
    <CTASection />
    <ConsultationSection />
    </Layout>
  )
}

export default Home
