import type { Metadata } from "next";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SecuritySection } from "@/components/home/SecuritySection";
import { FooterHome } from "@/components/home/FooterHome";

export const metadata: Metadata = {
  title: { absolute: "Portal HC | Hospital das Clínicas de Mineiros" },
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustBar />
        <HowItWorks />
        <SecuritySection />
      </main>
      <FooterHome />
    </>
  );
}
