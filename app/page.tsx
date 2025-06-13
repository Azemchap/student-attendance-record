import Features from "@/components/sections/Features";
import Hero from "@/components/sections/Hero";
import Newsletter from "@/components/sections/Newsletter";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
