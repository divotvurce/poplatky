import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import InvestmentCalculator from "./components/InvestmentCalculator";
import AboutPage from "./components/AboutPage";
import StoriesPage from "./components/StoriesPage";
import StoryDetail from "./components/StoryDetail";
import stories from "./data/storiesData";
import KalkulackyPage from "./components/KalkulackyPage";
import InvestmentComparisonCalculator from "./components/InvestmentComparisonCalculator";
import Kalkulacka from "./components/Kalkulacka";
import CompoundInterestCalculator from "./components/CompoundInterestCalculator";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kalkulacky" element={<KalkulackyPage />} />
          <Route path="/pribehy" element={<StoriesPage />} />
          <Route path="/pribehy/:id" element={<StoryDetail />} />
          <Route path="/o-projektu" element={<AboutPage />} />
          <Route path="/kalkulacky/srovnani" element={<InvestmentComparisonCalculator />} />
          <Route path="/kalkulacky/poplatky" element={<Kalkulacka />} />
          <Route path="/kalkulacky/slozene-uroceni" element={<CompoundInterestCalculator />} />
        </Routes>
      </main>

      <Footer /> 
    </div>
  );
}
