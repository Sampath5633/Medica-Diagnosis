import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

const NavigationBar: React.FC = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = (path: string) =>
    pathname === path
      ? 'text-blue-600 font-semibold flex items-center gap-2'
      : 'text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and MEDICA Text */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MEDICA</span>
          </div>

          {/* Hamburger Menu - Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/home" className={linkClass('/home')}>
              <Activity className="w-4 h-4 text-white bg-blue-600 rounded p-1" />
              Home
            </Link>
            <Link to="/diagnosis" className={linkClass('/diagnosis')}>
              <Activity className="w-5 h-5" />
              Health Diagnosis
            </Link>
            <Link to="/treatment" className={linkClass('/treatment')}>
              <Activity className="w-5 h-5" />
              Treatment Planner
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-6 pb-4 pt-2 shadow">
          <Link
            to="/home"
            className="block py-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/diagnosis"
            className="block py-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Health Diagnosis
          </Link>
          <Link
            to="/treatment"
            className="block py-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Treatment Planner
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
