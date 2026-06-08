import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  isAdminMode: boolean;
}

export default function Navbar({
  cartItemCount,
  onOpenCart,
  activeSection,
  onNavigate,
  isAdminMode
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Katalog', value: 'catalog' },
    { label: 'Testimoni', value: 'testimonials' },
    { label: 'Lacak Pesanan', value: 'tracker' },
  ];

  return (
    <>
      <nav
        id="navbar-root"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-sm py-4' : 'bg-white/80 backdrop-blur-md py-5'
        } border-b border-gray-100`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              id="navbar-logo"
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                onNavigate(isAdminMode ? 'admin' : 'catalog');
                setIsOpen(false);
              }}
            >
              {/* <div className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center">
                <span className="text-xl">🌙</span>
              </div> */}
              <span className="text-2xl font-black tracking-tight font-heading text-[#800020]">
                Bulan <span className="font-light text-gray-800">buket</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div id="navbar-links-desktop" className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  id={`nav-item-${item.value}`}
                  key={item.value}
                  onClick={() => onNavigate(item.value)}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    activeSection === item.value
                      ? 'text-[#800020] font-semibold'
                      : 'text-gray-600 hover:text-[#800020]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Buttons: Cart & Pesan Sekarang */}
            <div id="navbar-buttons-desktop" className="hidden md:flex items-center space-x-4">
              <button
                id="navbar-cart-btn"
                onClick={onOpenCart}
                className="relative p-2.5 text-gray-700 hover:text-[#800020] hover:bg-gray-50 rounded-full transition-all"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#800020] text-white text-xs font-bold rounded-full w-5.5 h-5.5 flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                id="navbar-order-cta"
                onClick={() => onNavigate('catalog')}
                className="bg-[#800020] text-white hover:bg-[#660018] px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg"
              >
                Pesan Sekarang
              </button>
            </div>

            {/* Mobile Actions: Cart & Menu Toggle */}
            <div id="navbar-mobile-actions" className="flex items-center space-x-3 md:hidden">
              <button
                id="navbar-cart-btn-mobile"
                onClick={onOpenCart}
                className="relative p-2 text-gray-700 hover:text-[#800020]"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#800020] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                id="navbar-menu-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-700 hover:text-[#800020] focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="navbar-mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navItems.map((item) => (
                  <button
                    id={`mobile-nav-item-${item.value}`}
                    key={item.value}
                    onClick={() => {
                      onNavigate(item.value);
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      activeSection === item.value
                        ? 'bg-[#800020]/10 text-[#800020] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-gray-100 px-4">
                  <button
                    id="mobile-navbar-cta"
                    onClick={() => {
                      onNavigate('catalog');
                      setIsOpen(false);
                    }}
                    className="w-full bg-[#800020] text-white hover:bg-[#660018] py-3 rounded-full text-center text-sm font-semibold tracking-wide transition-all shadow"
                  >
                    Mulai Belanja
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer to avoid navbar shielding the content */}
      <div className="h-16 md:h-20" />
    </>
  );
}
