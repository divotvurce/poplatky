import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import LandingPage from "./LandingPage";
import InvestmentCalculator from "./InvestmentCalculator";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kalkulacka" element={<InvestmentCalculator />} />
        </Routes>
      </main>

      <footer className="bg-blue-100 py-6 mt-auto text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Transparentní Poplatky. Všechny práva vyhrazena.
      </footer>
    </div>
  );
}
