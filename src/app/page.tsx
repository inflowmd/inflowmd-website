"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Specialties from "@/components/Specialties";
import Services from "@/components/Services";
import Showcase from "@/components/Showcase";
import Visibility from "@/components/Visibility";
import Process from "@/components/Process";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Specialties />
      <Services />
      <Showcase />
      <Visibility />
      <Process />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
