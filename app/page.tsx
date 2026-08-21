import type { Metadata } from "next";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { InfoCarousel } from "@/components/home/InfoCarousel";
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
        <InfoCarousel />
      </main>
      <FooterHome />
    </>
  );
}
