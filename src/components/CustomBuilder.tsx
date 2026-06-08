import React, { useState, useMemo } from 'react';
import { Plus, Minus, Check, Sparkles, AlertCircle, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface CustomBuilderProps {
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onClose?: () => void;
}

interface CustomFlower {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
  colors: { name: string; hex: string }[];
}

const FLOWERS_PRESETS: CustomFlower[] = [
  {
    id: 'fl-tulip',
    name: 'Tulip Kawat Bulu',
    price: 15000,
    icon: '🌷',
    desc: 'Simbol kasih sayang murni, anggun, & berkarakter minimalis modern.',
    colors: [
      { name: 'Merah Muda', hex: '#FFB7B2' },
      { name: 'Ungu Soft', hex: '#E8AEFF' },
      { name: 'Kuning Ceria', hex: '#FFDA77' },
      { name: 'Putih Bersih', hex: '#FDFBF7' },
      { name: 'Merah Anggun', hex: '#FF6B6B' }
    ]
  },
  {
    id: 'fl-rose',
    name: 'Mawar Premium',
    price: 18000,
    icon: '🌹',
    desc: 'Bunga mawar kawat bulu klasik, lambang romansa, cinta & apresiasi membara.',
    colors: [
      { name: 'Merah Crimson', hex: '#B8001F' },
      { name: 'Cream-Soft Pink', hex: '#FAD9C1' },
      { name: 'Putih Klasik', hex: '#F6F6F6' },
      { name: 'Biru Elektrik', hex: '#3A86FF' },
      { name: 'Kuning Gading', hex: '#FEE440' }
    ]
  },
  {
    id: 'fl-sunflower',
    name: 'Bunga Matahari',
    price: 22000,
    icon: '🌻',
    desc: 'Cerah, hangat & penuh energi positif. Sempurna untuk wisuda/kelulusan.',
    colors: [
      { name: 'Kuning Jingga', hex: '#FFB703' },
      { name: 'Kuning Lemon', hex: '#FFE715' },
      { name: 'Coklat Karamel', hex: '#A3704C' }
    ]
  },
  {
    id: 'fl-lavender',
    name: 'Lavender Rileks',
    price: 12000,
    icon: '🪻',
    desc: 'Ramping & estetik, memberikan sentuhan aroma kedamaian & misteri keluhuran.',
    colors: [
      { name: 'Ungu Lavender', hex: '#A29BFE' },
      { name: 'Ungu Tua', hex: '#6C5CE7' },
      { name: 'Putih Lilac', hex: '#F1ECFF' }
    ]
  },
  {
    id: 'fl-daisy',
    name: 'Daisy Minimalis',
    price: 10000,
    icon: '🌼',
    desc: 'Sederhana, manis, melambangkan keceriaan harian & ketulusan persahabatan.',
    colors: [
      { name: 'Putih Intisari Kuning', hex: '#FFFFFF' },
      { name: 'Merah Muda Pastel', hex: '#FFC6FF' },
      { name: 'Biru Langit', hex: '#9BF6FF' }
    ]
  }
];

const WRAPPING_PAPERS = [
  { id: 'wp-pink', name: 'Soft Pink Premium', hex: '#FED7D7', text: 'pink-300' },
  { id: 'wp-blue', name: 'Light Blue Matte', hex: '#BEE3F8', text: 'blue-300' },
  { id: 'wp-black', name: 'Elegant Charcoal Black', hex: '#2D3748', text: 'gray-800' },
  { id: 'wp-cream', name: 'Creamy Vanilla Aesthetic', hex: '#FEFCBF', text: 'yellow-100' },
  { id: 'wp-purple', name: 'Lilac Lavender Soft', hex: '#E9D8FD', text: 'purple-300' },
  { id: 'wp-green', name: 'Sage Green Velvet', hex: '#C6F6D5', text: 'green-300' },
  { id: 'wp-trans', name: 'Cellophane Transparant', hex: '#EDF2F7', text: 'slate-100' }
];

const RIBBONS = [
  { id: 'rb-gold', name: 'Pita Emas Satin', hex: '#D4AF37' },
  { id: 'rb-maroon', name: 'Pita Maroon Mewah', hex: '#800020' },
  { id: 'rb-pink', name: 'Pita Soft Pink', hex: '#FFB7B2' },
  { id: 'rb-white', name: 'Pita Putih Bersih', hex: '#FFFFFF' },
  { id: 'rb-blue', name: 'Pita Navy Blue', hex: '#1D4ED8' }
];

const BASE_CRAFT_FEE = 15000; // Flat price for packing & wrapping paper design

interface DraftedStem {
  presetId: string;
  name: string;
  colorName: string;
  colorHex: string;
  price: number;
  icon: string;
  quantity: number;
}

export default function CustomBuilder({ onAddToCart, onOpenCart }: CustomBuilderProps) {
  // Stems selection state: key is flower.id + '-' + colorHex
  const [selectedStems, setSelectedStems] = useState<Record<string, DraftedStem>>({});

  const [wrappingPaper, setWrappingPaper] = useState(WRAPPING_PAPERS[0]);
  const [ribbon, setRibbon] = useState(RIBBONS[0]);
  const [cardText, setCardText] = useState('');

  // Selected Active customization settings
  const [activePreset, setActivePreset] = useState<CustomFlower>(FLOWERS_PRESETS[0]);
  const [activeColor, setActiveColor] = useState(FLOWERS_PRESETS[0].colors[0]);

  // Handle adding stem selection
  const handleAddStem = () => {
    const key = `${activePreset.id}-${activeColor.hex}`;
    setSelectedStems(prev => {
      const current = prev[key];
      return {
        ...prev,
        [key]: {
          presetId: activePreset.id,
          name: activePreset.name,
          colorName: activeColor.name,
          colorHex: activeColor.hex,
          price: activePreset.price,
          icon: activePreset.icon,
          quantity: (current?.quantity || 0) + 1
        }
      };
    });
  };

  // Adjust stem quantity
  const updateStemQuantity = (key: string, delta: number) => {
    setSelectedStems(prev => {
      const current = prev[key];
      if (!current) return prev;
      const newQty = current.quantity + delta;
      
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }

      return {
        ...prev,
        [key]: {
          ...current,
          quantity: newQty
        }
      };
    });
  };

  // Summary Metrics
  const stemsList = useMemo<DraftedStem[]>(() => {
    return Object.values(selectedStems) as DraftedStem[];
  }, [selectedStems]);

  const totalStems = useMemo(() => {
    return stemsList.reduce((sum, item) => sum + item.quantity, 0);
  }, [stemsList]);

  const stemsCost = useMemo(() => {
    return stemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [stemsList]);

  const totalCost = useMemo(() => {
    if (totalStems === 0) return 0;
    return stemsCost + BASE_CRAFT_FEE;
  }, [stemsCost, totalStems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Add the custom setup directly to the shopping cart
  const handleAddToCartClick = () => {
    if (totalStems === 0) {
      alert('Silahkan tambahkan minimal 1 tangkai kawat bulu ke dalam rancangan Anda.');
      return;
    }

    const compiledItemsText = stemsList
      .map(item => `• ${item.quantity}x ${item.name} (${item.colorName})`)
      .join(', ');

    const description = `Buket Custom: ${compiledItemsText}. Warna Wrapping: ${wrappingPaper.name}. Pita: ${ribbon.name}. Kartu Ucapan: "${cardText || 'Sesuai template/Kosongan'}".`;

    const customProduct: Product = {
      id: `custom-bouquet-${Date.now()}`,
      name: `Buket Custom Kawat Bulu (${totalStems} Tangkai)`,
      price: totalCost,
      description: description,
      category: 'cat-custom', // Dynamic custom category
      image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=500&auto=format&fit=crop&q=60', // Beautiful bouquet fallback photo
      isAvailable: true,
      createdAt: new Date().toISOString()
    };

    onAddToCart(customProduct);
    
    // Clear custom form fields but notify elegantly
    setSelectedStems({});
    setCardText('');
    
    setTimeout(() => {
      onOpenCart();
    }, 400);
  };

  return (
    <section id="custom-builder-section" className="bg-white py-4 md:py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3">
          <span className="text-[#800020] font-bold text-xs md:text-sm tracking-widest uppercase flex items-center justify-center space-x-1">
            <Sparkles className="w-4 h-4 text-[#800020]" />
            <span>Kreativitas Tanpa Batas</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Costume Buket Kawat Bulu
          </h2>
          <div className="w-16 h-1 bg-[#800020] mx-auto rounded-full" />
          <p className="text-xs md:text-sm text-gray-500 font-light mt-2 px-2 max-w-xl mx-auto leading-relaxed">
            Rangkai sendiri buket bunga kawat bulu (chenille wire) impian Anda! Pilih jenis kuntum bunga, kombinasi warna, kertas pembungkus premium, & pita tercantik sesuai kepribadian penerima.
          </p>
        </div>

        {/* Master Interactive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          
          {/* LEFT/TOP PANELS: Virtual Interactive Canvas Preview (Col 2) */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24">
            <div className="bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center min-h-[420px] md:min-h-[480px] relative overflow-hidden shadow-xs">
              <div className="absolute inset-0 bg-radial from-[#800020]/2 to-transparent pointer-events-none" />
              
              {/* Virtual SVG Bouquet Render */}
              <div className="w-64 h-64 md:w-72 md:h-72 relative flex items-center justify-center">
                
                {/* Wrapping paper background layer (backing fan) */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform scale-110 drop-shadow-md select-none pointer-events-none transition-colors duration-500">
                  <path 
                    d="M 50,55 L 10,75 C 5,72 8,50 20,25 C 30,10 50,5 50,5 C 50,5 70,10 80,25 C 92,50 95,72 90,75 Z" 
                    fill={wrappingPaper.hex} 
                    opacity="0.85" 
                  />
                  <path 
                    d="M 50,55 L 20,80 C 15,75 18,60 30,35 C 38,20 50,15 50,15 C 50,15 62,20 70,35 C 82,60 85,75 80,80 Z" 
                    fill={wrappingPaper.hex} 
                    filter="brightness(0.92)"
                  />
                </svg>

                {/* Simulated Flower Stems Bunch Floating Inside Wrap */}
                <div className="absolute inset-0 flex flex-wrap items-center justify-center p-6 z-10">
                  {totalStems === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-400 max-w-[170px] select-none mx-auto space-y-1.5"
                    >
                      <span className="text-3xl text-gray-300">💐</span>
                      <p className="text-[11px] font-medium leading-relaxed font-sans">
                        Gunakan panel kanan untuk menambahkan kawat bulu & hiasan
                      </p>
                    </motion.div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Stems list rendered as interactive overlapping bubbles in flower-like positions */}
                      {stemsList.flatMap((item, idx_preset) => 
                        Array.from({ length: item.quantity }).map((_, i_qty) => {
                          // Generative coordinates based on indexes to keep layout deterministic for react re-renders
                          const seed = (idx_preset * 3) + i_qty;
                          const angle = (seed * 37) % 360;
                          const radius = 12 + ((seed * 11) % 25);
                          const rad = (angle * Math.PI) / 180;
                          const x = Math.cos(rad) * radius;
                          const y = Math.sin(rad) * radius - 15;

                          return (
                            <motion.div
                              key={`${item.presetId}-${item.colorHex}-${i_qty}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 120, damping: 10 }}
                              style={{ 
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: item.colorHex
                              }}
                              className="absolute w-8 h-8 rounded-full border border-white/50 shadow flex items-center justify-center text-xs text-shadow-sm select-none"
                              title={`${item.name} (${item.colorName})`}
                            >
                              <span className="transform -translate-y-[1px]">{item.icon}</span>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Wrapping paper cover flaps over items */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-20 select-none pointer-events-none transition-colors duration-500">
                  <path 
                    d="M 50,55 L 15,75 C 8,82 12,98 50,95 C 88,98 92,82 85,75 Z" 
                    fill={wrappingPaper.hex} 
                    opacity="0.95" 
                    filter="brightness(0.96)"
                  />
                  {/* Flap fold outlines */}
                  <path 
                    d="M 15,75 L 50,55 L 42,95 C 42,95 24,93 15,75" 
                    fill={wrappingPaper.hex} 
                    opacity="0.3"
                  />
                  <path 
                    d="M 85,75 L 50,55 L 58,95 C 58,95 76,93 85,75" 
                    fill={wrappingPaper.hex} 
                    opacity="0.3"
                  />
                  
                  {/* Tie Ribbon Node */}
                  <polygon 
                    points="42,76 58,76 55,80 45,80" 
                    fill={ribbon.hex} 
                    className="transition-colors duration-500 drop-shadow-sm" 
                  />
                  {/* Ribbon Tie Bow Loops */}
                  <path 
                    d="M 50,78 C 38,71 44,83 48,79 C 52,83 58,71 50,78 Z" 
                    fill={ribbon.hex} 
                    className="transition-colors duration-500" 
                  />
                  <path 
                    d="M 45,79 L 41,87 L 44,87 L 46,80 L 48,87 L 51,87" 
                    fill={ribbon.hex} 
                    className="transition-colors duration-500" 
                  />
                </svg>

              </div>

              {/* Dynamic Overlay Tags */}
              <div className="mt-8 text-center bg-white border border-gray-100 rounded-2xl py-3 px-5 shadow-xs w-full max-w-xs">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Rancangan Kombinasi</p>
                <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                  {totalStems} Tangkai Kawat Bulu
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-light">
                  Wrapping: <span className="text-gray-600 font-semibold">{wrappingPaper.name}</span>
                </p>
              </div>
            </div>

            {/* Custom Information Banner alert */}
            <div className="bg-[#800020]/4 border border-[#800020]/10 rounded-2xl p-4 flex items-start space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-[#800020] shrink-0 mt-0.5" />
              <div className="space-y-1 text-[#800020]">
                <p className="font-extrabold">Tips Florist Kawat Bulu:</p>
                <p className="font-light leading-relaxed">
                  Buket minimalis yang cantik biasanya berisi <span className="font-bold">5 s.d 10 tangkai</span> bunga. Untuk kado wisuda mewah luar biasa, disarankan menggunakan <span className="font-bold">12 s.d 15 tangkai</span> kuntum bunga beraneka warna!
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANELS: Selection Controls Form (Col 3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Step 1: Flower and Stems selector */}
            <div id="step-stems-selector" className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <span className="w-7 h-7 rounded-full bg-[#800020]/15 flex items-center justify-center text-xs font-bold text-[#800020]">1</span>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Pilih kuntum kawat bulu & Warnanya</h4>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Setiap kuntum kawat bulu dipelintir manual dengan cinta</p>
                </div>
              </div>

              {/* Selector Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FLOWERS_PRESETS.map((preset) => (
                  <button
                    id={`flower-preset-btn-${preset.id}`}
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset);
                      setActiveColor(preset.colors[0]); // Reset to first color of current preset
                    }}
                    className={`flex items-center space-x-2 p-3 border rounded-xl font-sans text-left transition ${
                      activePreset.id === preset.id
                        ? 'border-[#800020] bg-[#800020]/5/30 ring-2 ring-[#800020]/10 ring-offset-1'
                        : 'border-gray-100 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 line-clamp-1">{preset.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-[#800020] font-bold">{formatPrice(preset.price)}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bullet details context */}
              <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl font-light leading-relaxed">
                ℹ️ <strong className="font-semibold text-gray-700">{activePreset.name}:</strong> {activePreset.desc}
              </p>

              {/* Sub-Step: Pick Color for Selected Flower */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">🎨 Warna kelopak kuntum kawat bulu</label>
                <div className="flex flex-wrap gap-1.5">
                  {activePreset.colors.map((color) => {
                    const isSelected = activeColor.hex === color.hex;
                    return (
                      <button
                        id={`flower-color-${color.name}`}
                        key={color.hex}
                        onClick={() => setActiveColor(color)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs font-medium cursor-pointer transition ${
                          isSelected 
                            ? 'border-gray-700 bg-gray-800 text-white' 
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span 
                          style={{ backgroundColor: color.hex }}
                          className={`w-3.5 h-3.5 rounded-full border border-gray-300 block ${color.hex === '#FFFFFF' ? 'shadow-inner' : ''}`}
                        />
                        <span>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA trigger add to list */}
              <button
                id="btn-add-stems-to-bouquet"
                onClick={handleAddStem}
                className="w-full mt-4 bg-[#800020] text-white hover:bg-[#660018] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center"
              >
                <div className="inline-flex items-center justify-center gap-2 px-1.5 w-full">
                  <Plus className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-center leading-normal">Rangkai & Tambahkan Kuntum Ini</span>
                </div>
              </button>
            </div>

            {/* List of current stems drafted in Bouquet */}
            <div id="step-stems-draft" className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-xs space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">📋 Daftar Rangkaian Tangkai Buket Anda</p>
              
              {Object.keys(selectedStems).length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                  <p className="text-xs text-gray-400 font-light">Belum ada tangkai kawat bulu yang ditambahkan ke buket.</p>
                </div>
              ) : (
                <div id="stems-draft-list" className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {(Object.entries(selectedStems) as [string, DraftedStem][]).map(([key, item]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-50"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{item.name}</p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span 
                              style={{ backgroundColor: item.colorHex }}
                              className="w-2.5 h-2.5 rounded-full border border-gray-300 block"
                            />
                            <span className="text-[10px] text-gray-500 font-medium">{item.colorName}</span>
                            <span className="text-[9px] text-[#800020] font-bold">• @ {formatPrice(item.price)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Modifier controls */}
                      <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-xs">
                        <button
                          id={`stem-qty-dec-${key}`}
                          onClick={() => updateStemQuantity(key, -1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#800020] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 min-w-4 text-center">{item.quantity}</span>
                        <button
                          id={`stem-qty-inc-${key}`}
                          onClick={() => updateStemQuantity(key, 1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#800020] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Wrapping Paper and Ribbon config */}
            <div id="step-wrapping-ribbon" className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-xs space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <span className="w-7 h-7 rounded-full bg-[#800020]/15 flex items-center justify-center text-xs font-bold text-[#800020]">2</span>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Pilih Pembungkus & Pita Kado</h4>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Membungkus bouquet melipatgandakan kecantikan estetiknya</p>
                </div>
              </div>

              {/* Wrapping color selections */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">🎀 Warna Kertas Wrapping</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WRAPPING_PAPERS.map((paper) => {
                    const isSelected = wrappingPaper.id === paper.id;
                    return (
                      <button
                        id={`wrapping-paper-btn-${paper.id}`}
                        key={paper.id}
                        onClick={() => setWrappingPaper(paper)}
                        className={`flex items-center space-x-2 p-2 border rounded-xl text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? 'border-[#800020] bg-[#800020]/5/30 font-bold'
                            : 'border-gray-50 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span 
                          style={{ backgroundColor: paper.hex }}
                          className="w-4 h-4 rounded border border-gray-300 shadow-inner shrink-0"
                        />
                        <span className="truncate text-[11px] text-gray-700">{paper.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ribbon Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">🎗️ Pilihan Pita Pengikat</label>
                <div className="flex flex-wrap gap-2">
                  {RIBBONS.map((rib) => {
                    const isSelected = ribbon.id === rib.id;
                    return (
                      <button
                        id={`ribbon-btn-${rib.id}`}
                        key={rib.id}
                        onClick={() => setRibbon(rib)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs transition cursor-pointer ${
                          isSelected
                            ? 'border-gray-700 bg-gray-800 text-white font-bold'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span 
                          style={{ backgroundColor: rib.hex }}
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                        />
                        <span className="text-[10px] leading-none">{rib.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Greeting Cards textual fields */}
            <div id="step-greeting-card" className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <span className="w-7 h-7 rounded-full bg-[#800020]/15 flex items-center justify-center text-xs font-bold text-[#800020]">3</span>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Tulis Kartu Ucapan Gratis</h4>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5 font-sans">Setiap custom buket disertai 1 unit kartu ucapan cantik tulisan tangan</p>
                </div>
              </div>

              <div className="space-y-1">
                <textarea
                  id="custom-card-text-input"
                  rows={2}
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  placeholder="Contoh: 'Selamat wisuda sahabatku, moga sukses selalu ya ke depannya! Dari Sugi.'"
                  className="w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-[#800020]/20 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#800020]/10 resize-none font-sans"
                />
              </div>
            </div>

            {/* Total Pricing Billing and Checkout */}
            <div id="custom-builder-checkout" className="bg-[#1F2937] text-white p-6 md:p-8 rounded-3xl shadow-md space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-extrabold">Faktur / Rincian Custom Biaya</p>
                
                <div className="space-y-2 border-b border-dashed border-gray-700 pb-4 text-xs font-light text-gray-300">
                  <div className="flex justify-between">
                    <span>Gabungan Bunga Kawat ({totalStems} Tangkai)</span>
                    <span className="font-bold text-white">{formatPrice(stemsCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wrapping, Pita & Jasa Desain Merangkai</span>
                    <span className="font-bold text-green-400">
                      {totalStems > 0 ? formatPrice(BASE_CRAFT_FEE) : formatPrice(0)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-bold text-white">Total Estimasi Biaya:</span>
                  <span className="text-2xl font-black text-rose-400 font-heading">
                    {formatPrice(totalCost)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-add-custom-bouquet-to-cart"
                  onClick={handleAddToCartClick}
                  disabled={totalStems === 0}
                  className="w-full py-4 bg-[#800020] hover:bg-[#660018] disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 px-1.5">
                    <ShoppingBag className="w-4.5 h-4.5 shrink-0" />
                    <span className="text-center leading-normal">Masukkan Buket Custom Ke Keranjang</span>
                  </div>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-gray-400 justify-center">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span className="font-heading">Tiap rangkaian dikerjakan penuh ketelitian & bersteker rapi</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
