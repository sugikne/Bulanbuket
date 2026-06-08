import React from 'react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import bouquetRoseRed from '../assets/images/bouquet_rose_red_1780653519699.png';

interface HeroProps {
  onNavigateToCatalog: () => void;
  title?: string;
  description?: string;
}

export default function Hero({ onNavigateToCatalog, title, description }: HeroProps) {
  return (
    <section id="hero-section" className="relative overflow-hidden bg-white pt-4 md:pt-6 pb-12 lg:pb-24">
      {/* Abstract decorative layout shapes representing artistry */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#800020]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-gray-50 rounded-full blur-2xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headings & CTA */}
          <div id="hero-copy" className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-[#800020]/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-[#800020] uppercase"
            >
              <Sparkles className="w-4 h-4" />
              <span>Premium Fuzzy Wire Florist Craft</span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Moon Bouquet<br />
                <span className="text-[#800020] font-light italic font-heading">
                  {title || 'Buket Handmade yang Unik, Cantik, dan Berkesan'}
                </span>
              </h1>
              <p className="text-base sm:text-xl text-gray-600 max-w-2xl font-light leading-relaxed">
                {description || 'Temukan buket bunga kawat bulu premium untuk hadiah spesial, wisuda, ulang tahun, dan berbagai momen berharga.'}
              </p>
            </motion.div>

            {/* Quick Benefits Badges */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-700 font-medium"
            >
              <div className="flex items-center space-x-1.5 bg-[#800020]/5 px-3 py-1.5 rounded-full border border-[#800020]/10">
                <Heart className="w-3.5 h-3.5 text-[#800020] fill-[#800020]/10" />
                <span className="font-semibold text-gray-800">Tak Pernah Layu</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-[#800020]/5 px-3 py-1.5 rounded-full border border-[#800020]/10">
                <Sparkles className="w-3.5 h-3.5 text-[#800020]" />
                <span className="font-semibold text-gray-800 font-sans text-xs">Custom Request</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-[#800020]/5 px-3 py-1.5 rounded-full border border-[#800020]/10">
                <span className="text-xs">🚚</span>
                <span className="font-semibold text-gray-800">Kirim Se-Indonesia</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                id="hero-btn-order"
                onClick={onNavigateToCatalog}
                className="btn-primary space-x-2 shadow-md hover:shadow-xl group"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                id="hero-btn-catalog"
                onClick={onNavigateToCatalog}
                className="btn-outline"
              >
                Lihat Katalog
              </button>
            </motion.div>
          </div>

          {/* Right Column: Premium Image Graphics */}
          <div id="hero-img-showcase" className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md"
            >
              {/* Back Circle Decoration Accent */}
              <div className="absolute inset-0 bg-[#800020]/10 rounded-3xl transform rotate-3 scale-102 -z-10" />
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <img
                  id="hero-primary-image"
                  src={bouquetRoseRed}
                  alt="Exclusive Moon Bouquet Craft"
                  className="w-full h-auto object-cover rounded-2xl transform hover:scale-105 duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Review Alert Box */}
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white/95 backdrop-blur-md p-3 md:px-5 md:py-4 rounded-2xl border border-gray-100 shadow-lg flex items-center space-x-2.5 md:space-x-3.5">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-50 flex items-center justify-center text-base md:text-lg shrink-0">
                    ✨
                  </div>
                  <div>
                    <div className="flex text-yellow-400 text-[10px] md:text-xs">
                      ★★★★★
                    </div>
                    <p className="text-[10px] md:text-xs font-semibold text-gray-800 tracking-tight mt-0.5">
                      "Handmade berkualitas tinggi, awet bertahun-tahun!"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
