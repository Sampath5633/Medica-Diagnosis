import React, { useState } from 'react';
import { Activity, HeartPulse, Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const FullNavigationBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and MEDICA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <Link to="/home" className="text-lg sm:text-xl font-bold text-blue-500 no-underline">
              MEDICA
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('/home')}
              className="text-black font-medium flex items-center gap-2 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Home
            </button>
            <button
              onClick={() => handleNavClick('/diagnosis')}
              className="text-black hover:text-blue-600 transition-colors flex items-center gap-2 bg-transparent border-none cursor-pointer"
            >
              <HeartPulse className="w-5 h-5" />
              Health Diagnosis
            </button>
            <button
              onClick={() => handleNavClick('/treatment')}
              className="text-black hover:text-blue-600 transition-colors flex items-center gap-2 bg-transparent border-none cursor-pointer"
            >
              <Activity className="w-5 h-5" />
              Treatment Planner
            </button>
            <button
              onClick={handleSignOut}
              className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-black p-2 hover:bg-black/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-blue-200 shadow-lg transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
          }`}
        >
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => handleNavClick('/home')}
              className="flex items-center gap-3 text-black font-medium py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors w-full text-left"
            >
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Home
            </button>
            <button 
              onClick={() => handleNavClick('/diagnosis')}
              className="flex items-center gap-3 text-black py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors bg-transparent border-none cursor-pointer w-full text-left"
            >
              <HeartPulse className="w-5 h-5 text-green-600" />
              Health Diagnosis
            </button>
            <button
              onClick={() => handleNavClick('/treatment')}
              className="flex items-center gap-3 text-black py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors bg-transparent border-none cursor-pointer w-full text-left"
            >
              <Activity className="w-5 h-5 text-blue-600" />
              Treatment Planner
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-red-600 py-3 px-4 rounded-lg hover:bg-red-100 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FullNavigationBar;
