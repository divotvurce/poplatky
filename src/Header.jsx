import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo vlevo */}
        <div className="text-2xl font-bold text-indigo-900">
          <Link to="/">Transparentní Poplatky</Link>
        </div>
    

        {/* Menu pro desktop */}
        <nav className="hidden md:flex space-x-8 text-indigo-900 font-semibold">
          <Link to="/" className="hover:underline">
            Domů
          </Link>
          <Link to="/kalkulacka" className="hover:underline">
            Kalkulačky
          </Link>
          <Link to="/pribehy" className="hover:underline">
            Příběhy
          </Link>
        <Link to="/pribehy" className="hover:underline">
            O projektu
          </Link>
        </nav>

        {/* Tlačítko pro mobilní menu */}
        <button
          className="md:hidden text-blue-600 focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {/* Jednoduchá ikonka hamburger menu */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileOpen ? (
              // Křížek pro zavření menu
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger menu
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobilní menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <Link
            to="/"
            className="block px-6 py-3 text-blue-600 font-semibold hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Domů
          </Link>
          <Link
            to="/kalkulacka"
            className="block px-6 py-3 text-blue-600 font-semibold hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Kalkulačka
          </Link>
          <Link
            to="/pribehy"
            className="block px-6 py-3 text-blue-600 font-semibold hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Příběhy
          </Link>
        </nav>
      )}
    </header>
  );
}

