import React, { useState } from 'react';
import { Search, ShoppingCart, Filter, Info, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category } from '../types';

interface CatalogProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  onNavigateToCustom?: () => void;
}

export default function Catalog({ products, categories, onAddToCart, onNavigateToCustom }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products based on search and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <section id="catalog-section" className="bg-[#F8F9FA] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-12 space-y-2 md:space-y-3">
          <span className="text-[#800020] font-bold text-xs md:text-sm tracking-wider md:tracking-widest uppercase">Pilihan Kado Istimewa</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Katalog Buket Premium
          </h2>
          <div className="w-12 md:w-16 h-1 bg-[#800020] mx-auto rounded-full" />
          <p className="text-xs md:text-sm text-gray-500 font-light mt-1 md:mt-2 px-2">
            Mulai dari mawar romantis hingga buket wisuda ceria, telusuri karya handmade kawat bulu terbaik dari Moon Bouquet.
          </p>
        </div>

        {/* Search & Filters Controls */}
        <div id="catalog-controls-container" className="bg-white p-3 md:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-10 flex flex-col md:flex-row gap-3.5 md:gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Cari buket kawat bulu favorit Anda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-[#800020]/25 rounded-xl text-xs md:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#800020]/10"
            />
          </div>

          {/* Category Filter Chips */}
          <div id="catalog-filter-chips" className="flex overflow-x-auto no-scrollbar gap-1.5 w-full md:w-auto justify-start md:justify-end pb-1 md:pb-0 scroll-smooth snap-x">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-wide transition-all uppercase whitespace-nowrap cursor-pointer snap-start ${
                selectedCategory === 'all'
                  ? 'bg-[#800020] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-wide transition-all uppercase whitespace-nowrap cursor-pointer snap-start ${
                  selectedCategory === cat.id
                    ? 'bg-[#800020] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name.split('/')[0].trim()}
              </button>
            ))}
          </div>

        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div id="catalog-empty-state" className="bg-white rounded-2xl border border-gray-100 py-16 px-4 text-center">
            <p className="text-gray-400 text-lg">Buket yang Anda cari tidak ditemukan.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-[#800020] underline font-semibold text-sm cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div id="catalog-products-grid" className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {/* Special Creative Custom Bouquet Builder Promo Card inside Grid */}
            {onNavigateToCustom && (
              <motion.div
                id="custom-bouquet-promo-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#800020] to-[#570014] text-white rounded-2xl md:rounded-[20px] p-6 shadow-md flex flex-col justify-between h-full relative overflow-hidden text-left cursor-default"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />
                
                <div className="space-y-4 relative z-10 select-none">
                  <span className="inline-block px-2.5 py-1 bg-white/15 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Desain Sendiri
                  </span>
                  <h3 className="text-lg md:text-xl font-extrabold font-heading leading-tight text-white">
                    Buket Kawat Bulu Custom 🎨
                  </h3>
                  <p className="text-xs text-white/80 font-light leading-relaxed">
                    Pilih tangkai bunga (Tulip, Mawar, Daisy, Matahari, Lavender) & kombinasi warna wrapping premium kreasimu!
                  </p>
                  <div className="text-[10px] text-white/70 space-y-1 bg-black/15 p-2.5 rounded-xl font-light">
                    <p>✨ Pilih kuntum bunga & kombinasi warna</p>
                    <p>✨ Pilih kertas pembungkus premium</p>
                    <p>✨ Tulis kartu pesan ucapan gratis</p>
                  </div>
                </div>

                <div className="pt-6 relative z-10">
                  <button
                    id="promo-start-custom-btn"
                    onClick={onNavigateToCustom}
                    className="w-full bg-white text-[#800020] hover:bg-gray-50 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Mulai Merangkai 💐</span>
                  </button>
                </div>
              </motion.div>
            )}

            {filteredProducts.map((product, index) => (
              <motion.div
                id={`product-card-${product.id}`}
                key={product.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.05,
                  layout: { type: 'spring', stiffness: 200, damping: 25 }
                }}
                className="bg-white rounded-2xl md:rounded-[20px] border border-gray-100/80 shadow-sm md:shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full relative transition-all"
              >
                {/* Product Image and ribbon */}
                <div className="relative pt-[100%] bg-gray-50 overflow-hidden group cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Availability Badge */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                    <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-extrabold uppercase tracking-wider shadow ${
                      product.isAvailable ? 'bg-green-100/90 text-green-700' : 'bg-orange-100/90 text-orange-700'
                    }`}>
                      {product.isAvailable ? 'Sedia' : 'P.O'}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3 md:p-6 flex flex-col flex-grow">
                  <div className="flex-grow space-y-1 md:space-y-2">
                    <span className="text-[9px] md:text-xs uppercase font-bold tracking-wider text-gray-400">
                      {categories.find(c => c.id === product.category)?.name || 'Buket Bunga'}
                    </span>
                    <h3 className="text-sm md:text-lg font-bold text-gray-800 hover:text-[#800020] leading-snug line-clamp-1 md:line-clamp-2 cursor-pointer transition-colors" onClick={() => setSelectedProduct(product)}>
                      {product.name}
                    </h3>
                    <p className="text-sm md:text-2xl font-black text-[#800020] mt-0.5 md:mt-1 font-heading">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1 md:line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 pt-3 md:pt-6 mt-3 md:mt-4 border-t border-gray-50">
                    <button
                      id={`detail-btn-${product.id}`}
                      onClick={() => setSelectedProduct(product)}
                      className="w-full sm:flex-1 border border-[#800020] hover:bg-[#800020]/10 text-[#800020] py-2 md:py-3.5 rounded-xl text-[9px] md:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Info className="w-3 md:w-4 h-3 md:h-4 shrink-0" />
                      <span>Detail</span>
                    </button>
                    <button
                      id={`add-cart-btn-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="w-full sm:flex-3 bg-[#800020] hover:bg-[#660018] text-white py-2 md:py-3.5 rounded-xl text-[9px] md:text-[11px] font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-3 md:w-4 h-3 md:h-4 shrink-0" />
                      <span>Keranjang</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div id="product-detail-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                id="close-product-detail"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/90 shadow hover:bg-gray-100 p-2 rounded-full z-20 cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Product Image */}
                <div className="relative pt-[100%] md:pt-0 md:h-[500px]">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Right Side: Product Details info */}
                <div className="p-5 md:p-8 flex flex-col justify-between h-full md:h-[500px] overflow-y-auto">
                  <div className="space-y-3.5 md:space-y-4">
                    <span className="inline-block px-3 py-1 bg-[#800020]/10 text-[#800020] text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider">
                      {categories.find(c => c.id === selectedProduct.category)?.name || 'Kawat Bulu'}
                    </span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                      {selectedProduct.name}
                    </h2>
                    
                    <div className="flex items-center space-x-2.5">
                      <p className="text-2xl md:text-3xl font-black text-[#800020] font-heading">
                        {formatPrice(selectedProduct.price)}
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase ${
                        selectedProduct.isAvailable ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {selectedProduct.isAvailable ? 'Sedia / Ready' : 'Pre-order'}
                      </span>
                    </div>

                    <div className="border-t border-b border-gray-100 py-3 md:py-4 space-y-1.5 md:space-y-2 text-xs md:text-sm">
                      <p className="font-semibold text-gray-800">Spesifikasi & Deskripsi:</p>
                      <p className="text-gray-500 font-light leading-relaxed">
                        {selectedProduct.description}
                      </p>
                      <ul className="text-gray-500 leading-relaxed space-y-1 text-[11px] md:text-xs pt-1.5">
                        <li>• Bahan Utama: Kawat Bulu Chenille premium bertekstur tebal dan halus</li>
                        <li>• Bebas Layu, Bebas Jamur, Awet Bertahun-tahun!</li>
                        <li>• Sempurna untuk kado wisuda, pacar, anniversary, atau perayaan spesial.</li>
                        <li>• Bisa disisipkan kartu ucapan custom (Tulis pada catatan saat checkout).</li>
                      </ul>
                    </div>
                  </div>

                  {/* Actions inside detail template */}
                  <div className="pt-4 md:pt-6">
                    <button
                      id="detail-add-to-cart"
                      onClick={() => {
                        onAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="btn-primary w-full py-3 md:py-4 text-xs md:text-sm tracking-widest uppercase flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                    >
                      <ShoppingCart className="w-4.5 h-4.5 md:w-5 md:h-5 shrink-0" />
                      <span>Tambahkan ke Keranjang Belanja</span>
                    </button>
                    <p className="text-[9px] md:text-[10px] text-gray-400 text-center mt-2.5">
                      Kelola kado Anda di keranjang belanja, pesanan akan dikirimkan langsung ke admin via WhatsApp Anda
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
