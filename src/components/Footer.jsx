import React from 'react';
import { FaInstagram, FaGithub } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-indigo-50 to-indigo-100 text-gray-800 py-8 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        {/* Copyright */}
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-600">
            © {currentYear} Transparentní Poplatky. Všechna práva vyhrazena.
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-6">
          <a
            href="https://www.threads.net/@vas_threads_profil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            aria-label="Threads"
          >
            <SiThreads className="w-6 h-6" /> 
          </a>
          <a
            href="https://www.instagram.com/vas_instagram_profil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            aria-label="Instagram"
          >
            <FaInstagram className="w-6 h-6" />
          </a>
          <a
            href="https://github.com/vas_github_profil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            aria-label="GitHub"
          >
            <FaGithub className="w-6 h-6" /> 
          </a>
        </div>
      </div>
    </footer>
  );
}