import type { Metadata } from "next";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { CardsRecursos } from "@/components/home/CardsRecursos";
import { FaixaRecursos } from "@/components/home/FaixaRecursos";
import { FooterHome } from "@/components/home/FooterHome";

export const metadata: Metadata = {
  title: { absolute: "Portal HC | Hospital das Clínicas de Mineiros" },
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-hc-navy-1">
        <HeroSection />
        <CardsRecursos />
        <FaixaRecursos />
      </main>
      <FooterHome />
    </>
  );
}
