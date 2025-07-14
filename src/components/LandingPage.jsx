import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white text-gray-800 flex flex-col min-h-[calc(100vh-8rem)] px-6 py-12 max-w-4xl mx-auto">
      <section className="text-center py-20 bg-gradient-to-b from-indigo-50 to-white rounded-lg shadow-md">
        <h2 className="text-5xl font-extrabold text-indigo-900 mb-6">
          Proč Transparentní Poplatky?
        </h2>
        <p className="max-w-xl mx-auto text-indigo-700 text-lg mb-10">
          Pomáháme vám odhalit skryté poplatky a získat kontrolu nad vašimi investicemi.
        </p>
        <Link
          to="/kalkulacka"
          className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:bg-indigo-700 transition"
        >
          Vyzkoušet kalkulačku
        </Link>
      </section>

      <section id="calculator" className="mb-20 mt-20">
        <h3 className="text-3xl font-bold mb-6 text-blue-700">Investiční kalkulačka</h3>
        <p className="mb-6 text-gray-700">
          Spočítejte si, jaké poplatky platíte, a zjistěte, jak mohou ovlivnit vaše investice v čase.
        </p>
        <Link to="/kalkulacka" className="text-blue-600 underline hover:text-blue-800">
          Otevřít kalkulačku
        </Link>
      </section>

      <section id="stories" className="mb-20">
        <h3 className="text-3xl font-bold mb-6 text-blue-700">Příběhy podvedených</h3>
        <p className="mb-6 text-gray-700">
          V této sekci budu sdílet příběhy lidí, kteří byli nečestně oklamáni nebo nedostali jasné informace o poplatcích.
        </p>
        <p className="italic text-gray-500">Tuto část budu postupně doplňovat...</p>
      </section>

      <section id="comparison" className="mb-20">
        <h3 className="text-3xl font-bold mb-6 text-blue-700">Srovnání fondů a alternativ</h3>
        <p className="mb-6 text-gray-700">
          Plánuji zde přehledně zobrazit srovnání běžných investičních fondů, jejich poplatků a případně i alternativních možností.
        </p>
        <p className="italic text-gray-500">Brzy k dispozici.</p>
      </section>
    </div>
  );
}

