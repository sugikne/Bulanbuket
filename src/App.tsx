import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Product, Category, Order, Testimonial, SystemSettings } from './types';
import {
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_TESTIMONIALS, DEFAULT_SETTINGS
} from './lib/initialData';
import {
  getSavedSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseCategories,
  getSupabaseProducts,
  getSupabaseTestimonials,
  getSupabaseOrders,
  addSupabaseOrder,
  addSupabaseTestimonial,
  addSupabaseCategory,
  addSupabaseProduct,
  getSupabaseSettings,
  updateSupabaseSettings,
  trackSupabaseOrdersByPhone
} from './lib/supabaseDb';

import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Component Imports
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import CartModal from './components/CartModal';
import Testimonials from './components/Testimonials';
import OrderTracker from './components/OrderTracker';
import Dashboard from './components/Dashboard';
import CustomBuilder from './components/CustomBuilder';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('catalog');
  const [user, setUser] = useState<User | null>(null);
  
  // App Core States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Cart Mechanics States
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Initial Readiness
  const [isInitialized, setIsInitialized] = useState(false);

  // Track Auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsub();
  }, []);

  // Database Fetch and Seeding Orchestrator
  const fetchData = async () => {
    try {
      let activeSettings = DEFAULT_SETTINGS;
      let activeCategories: Category[] = [];
      let activeProducts: Product[] = [];
      let activeTestimonials: Testimonial[] = [];
      let activeOrders: Order[] = [];

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        try {
          // 1. Fetch Settings from Supabase
          try {
            const sbSettings = await getSupabaseSettings();
            if (sbSettings) {
              activeSettings = sbSettings;
            } else {
              const savedSettings = localStorage.getItem('local_settings');
              if (savedSettings) activeSettings = JSON.parse(savedSettings);
            }
          } catch (err) {
            console.warn('Silent fallback for store settings:', err);
            const savedSettings = localStorage.getItem('local_settings');
            if (savedSettings) activeSettings = JSON.parse(savedSettings);
          }

          // 2. Fetch standard collections with localStorage fallback
          try {
            activeCategories = await getSupabaseCategories();
          } catch (err) {
            console.warn('Fallback category read on database error:', err);
            const savedCats = localStorage.getItem('local_categories');
            activeCategories = savedCats ? JSON.parse(savedCats) : INITIAL_CATEGORIES;
          }

          try {
            activeProducts = await getSupabaseProducts();
          } catch (err) {
            console.warn('Fallback product read on database error:', err);
            const savedProds = localStorage.getItem('local_products');
            activeProducts = savedProds ? JSON.parse(savedProds) : INITIAL_PRODUCTS.map(p => ({ ...p, createdAt: new Date().toISOString() })) as Product[];
          }

          try {
            activeTestimonials = await getSupabaseTestimonials();
          } catch (err) {
            console.warn('Fallback testimonial read on database error:', err);
            const savedTests = localStorage.getItem('local_testimonials');
            activeTestimonials = savedTests ? JSON.parse(savedTests) : INITIAL_TESTIMONIALS.map(t => ({ ...t, createdAt: new Date().toISOString() })) as Testimonial[];
          }
          
          try {
            activeOrders = await getSupabaseOrders();
            setOrders(activeOrders);
          } catch (ordErr) {
            console.warn('Silent read or fallback for orders', ordErr);
            const savedOrders = localStorage.getItem('local_orders');
            activeOrders = savedOrders ? JSON.parse(savedOrders) : [];
            setOrders(activeOrders);
          }

          // Automatic database seeding if empty (and Supabase has tables/fetching didn't throw)
          let hasTableError = false;
          try {
            await getSupabaseCategories();
          } catch {
            hasTableError = true;
          }

          if (!hasTableError && activeCategories.length === 0 && activeProducts.length === 0) {
            console.log('Supabase database empty. Seeding initially...');
            try {
              for (const cat of INITIAL_CATEGORIES) {
                await addSupabaseCategory(cat);
              }
              for (const prod of INITIAL_PRODUCTS) {
                await addSupabaseProduct({
                  ...prod,
                  createdAt: new Date().toISOString()
                });
              }
              for (const test of INITIAL_TESTIMONIALS) {
                await addSupabaseTestimonial({
                  ...test,
                  createdAt: new Date().toISOString()
                });
              }
              // Populate
              activeCategories = await getSupabaseCategories();
              activeProducts = await getSupabaseProducts();
              activeTestimonials = await getSupabaseTestimonials();
            } catch (seedErr) {
              console.warn('Supabase automatic seeding failed:', seedErr);
            }
          }
        } catch (sbError) {
          console.warn('Could not query connected Supabase database.', sbError);
        }
      } else {
        // Fallback to static mock datasets stored in localStorage when Supabase is not configured yet
        console.log('Supabase not configured. Presenting client-side interactive dataset.');
        
        // Load settings or fallback & store
        const savedSettings = localStorage.getItem('local_settings');
        if (savedSettings) {
          activeSettings = JSON.parse(savedSettings);
        } else {
          activeSettings = DEFAULT_SETTINGS;
          localStorage.setItem('local_settings', JSON.stringify(DEFAULT_SETTINGS));
        }

        // Load categories or fallback & store
        const savedCats = localStorage.getItem('local_categories');
        if (savedCats) {
          activeCategories = JSON.parse(savedCats);
        } else {
          activeCategories = INITIAL_CATEGORIES;
          localStorage.setItem('local_categories', JSON.stringify(INITIAL_CATEGORIES));
        }

        // Load products or fallback & store
        const savedProds = localStorage.getItem('local_products');
        if (savedProds) {
          activeProducts = JSON.parse(savedProds);
        } else {
          activeProducts = INITIAL_PRODUCTS.map(p => ({ ...p, createdAt: new Date().toISOString() })) as Product[];
          localStorage.setItem('local_products', JSON.stringify(activeProducts));
        }

        // Load testimonials or fallback & store
        const savedTests = localStorage.getItem('local_testimonials');
        if (savedTests) {
          activeTestimonials = JSON.parse(savedTests);
        } else {
          activeTestimonials = INITIAL_TESTIMONIALS.map(t => ({ ...t, createdAt: new Date().toISOString() })) as Testimonial[];
          localStorage.setItem('local_testimonials', JSON.stringify(activeTestimonials));
        }

        // Load orders or fallback & store
        const savedOrders = localStorage.getItem('local_orders');
        if (savedOrders) {
          activeOrders = JSON.parse(savedOrders);
        } else {
          activeOrders = [];
          localStorage.setItem('local_orders', JSON.stringify(activeOrders));
        }
        setOrders(activeOrders);
      }

      setSettings(activeSettings);
      setCategories(activeCategories);
      setProducts(activeProducts);
      setTestimonials(activeTestimonials);
    } catch (err) {
      console.error('Core applet synchronization failed: ', err);
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Smooth scroll to selected sections
  useEffect(() => {
    if (activeSection && activeSection !== 'admin') {
      const targetId = activeSection === 'catalog' ? 'catalog-section' : `${activeSection}-anchor`;
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSection]);

  // --- CART MECHANICS OPTIONS ---
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const copy = [...prevCart];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    // Triggers sidebar shelf notification
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- ORDER PLACEMENT ---
  const handlePlaceOrder = async (customerDetails: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes: string;
  }) => {
    const orderId = 'order-' + Date.now().toString(36);
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      costPrice: item.product.costPrice || 0,
      quantity: item.quantity
    }));

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const orderData: Order = {
      id: orderId,
      customerName: customerDetails.customerName,
      customerPhone: customerDetails.customerPhone,
      customerAddress: customerDetails.customerAddress,
      items: orderItems,
      totalAmount,
      status: 'pending',
      notes: customerDetails.notes,
      createdAt: new Date().toISOString()
    };

    try {
      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        await addSupabaseOrder(orderData);
        alert('Pesanan berhasil dibuat! Anda sekarang dapat melacak pesanan di tab Lacak Pesanan dengan nomor telepon Anda.');
      } else {
        // Simulasikan pesanan lokal jika Supabase belum terhubung
        const savedOrders = localStorage.getItem('local_orders');
        const localOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [];
        const updated = [orderData, ...localOrders];
        localStorage.setItem('local_orders', JSON.stringify(updated));
        setOrders(updated);
        alert('Pemesanan Berhasil Disimulasikan! (Catatan: Supabase belum dikonfigurasi, data disimpan di memori browser).');
      }

      setCart([]); // Clear Cart upon secure persistence
      fetchData(); // Sync admin statistics
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengirimkan order ke Supabase: ' + (err.message || err));
    }
  };

  // --- TESTIMONIAL SUBMISSION ---
  const handleSubmitTestimonial = async (name: string, rating: number, text: string, phone: string) => {
    const testimonialId = 'test-' + Date.now().toString(36);
    const newTest: Testimonial = {
      id: testimonialId,
      name,
      rating,
      text,
      isApproved: false, // Moderated default restriction
      createdAt: new Date().toISOString()
    };

    try {
      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        // 1. Ambil seluruh pesanan/orders yang memiliki handphone yang sama
        const buyerOrders = await trackSupabaseOrdersByPhone(phone.trim());
        if (!buyerOrders || buyerOrders.length === 0) {
          throw new Error('Nomor telepon ini tidak terdaftar dalam riwayat transaksi kami. Hanya pembeli asli terverifikasi yang bisa menulis ulasan.');
        }

        // 2. Tambah testimonial ke Supabase
        await addSupabaseTestimonial(newTest);
        alert('Testimonial Anda berhasil dikirim! Menunggu persetujuan (approval) oleh Admin sebelum ditampilkan secara umum.');
      } else {
        // Simulasikan uji verifikasi lokal di memori browser
        const isPhoneInSimulatedOrders = orders.some(o => o.customerPhone.trim() === phone.trim());
        if (orders.length > 0 && !isPhoneInSimulatedOrders) {
          throw new Error('Nomor telepon tidak terdaftar pada daftar order simulasi lokal. Silakan lakukan pemesanan terlebih dahulu dengan nomor telepon tersebut.');
        }

        // Simulasikan testimonial lokal
        const savedTests = localStorage.getItem('local_testimonials');
        const localTests: Testimonial[] = savedTests ? JSON.parse(savedTests) : [];
        const updated = [newTest, ...localTests];
        localStorage.setItem('local_testimonials', JSON.stringify(updated));
        setTestimonials(updated);
        alert('Ulasan Berhasil Disimulasikan! (Catatan: Supabase belum terhubung, ulasan lolos verifikasi nomor telepon disimpan di memori browser).');
      }

      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Validasi Gagal: ' + (err.message || err));
      throw err;
    }
  };

  // Dynamic SEO calculation to target local florist searches in Nusa Penida
  const getSEOContent = () => {
    const baseKeywords = "nusa penida buket, buket nusa penida, florist nusa penida, buket kawat bulu nusa penida, kado nusa penida, florist bali, custom buket d Nusa Penida, moon bouquet, toko bunga nusa penida, beli buket nusa penida, kado cantik nusa penida";
    
    switch (activeSection) {
      case 'testimonials':
        return {
          title: "Ulasan & Testimoni Pelanggan | Moon Bouquet Nusa Penida",
          description: "Baca ulasan asli dan foto kepuasan pelanggan Moon Bouquet Nusa Penida. Penyedia buket bunga kawat bulu (chenille wire) terbaik, unik, dan anti layman di Nusa Penida, Bali.",
          keywords: `testimoni buket nusa penida, ulasan florist nusa penida, review customer moon bouquet, ${baseKeywords}`
        };
      case 'tracker':
        return {
          title: "Lacak Pesanan Florist Online | Moon Bouquet Nusa Penida",
          description: "Lacak perkembangan pembuatan dan pengantaran kado buket bunga kawat bulu istimewa Anda di Nusa Penida secara langsung dan real-time lewat WhatsApp terintegrasi.",
          keywords: `lacak pesanan bunga nusa penida, status buket nusa penida, tracking order florist, ${baseKeywords}`
        };
      case 'admin':
        return {
          title: "Portal Admin Utama | Moon Bouquet Nusa Penida",
          description: "Sistem manajemen stok, katalog buket, daftar pesanan, ulasan testimoni, dan konfigurasi toko florist Moon Bouquet Nusa Penida.",
          keywords: baseKeywords
        };
      case 'custom':
        return {
          title: "Desain Buket Custom Kawat Bulu | Moon Bouquet Nusa Penida",
          description: "Rancang sendiri buket bunga kawat bulu (chenille wire) idaman Anda secara online! Pilih warna wrapping, warna pita, dan gabungan kuntum bunga unik yang Anda sukai di florist terbaik Nusa Penida.",
          keywords: `custom buket nusa penida, costume buket kawat bulu, rangkaian bunga custom, kado personal nusa penida, ${baseKeywords}`
        };
      case 'catalog':
      default:
        return {
          title: "Moon Bouquet | Florist Buket Kawat Bulu Nusa Penida - Premium & Awet",
          description: settings.heroDescription || "Spesialis kado dan buket kawat bulu (chenille wire) premium khas Nusa Penida. Indah, awet selamanya, bebas jamur, dan sedia custom sesuai keinginan khusus untuk kado wisuda, ulang tahun dll.",
          keywords: baseKeywords
        };
    }
  };

  const { title: seoTitle, description: seoDescription, keywords: seoKeywords } = getSEOContent();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://moonbouquet.com';
  const featuredProductImage = products && products.length > 0 ? products[0].image : '';

  return (
    <div id="applet-main-canvas" className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      
      {/* React Helmet for Dynamic SEO Metadata */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="Moon Bouquet Nusa Penida" />
        {featuredProductImage && <meta property="og:image" content={featuredProductImage} />}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {featuredProductImage && <meta name="twitter:image" content={featuredProductImage} />}

        {/* Additional Useful SEO Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      
      {/* Sticky Top Navbar */}
      <Navbar
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
        onNavigate={(sec) => setActiveSection(sec)}
        isAdminMode={activeSection === 'admin'}
      />

      {/* Cart Drawer Slideout modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        whatsappNumber={settings.whatsappNumber}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Custom Bouquet Design Builder Popup Modal */}
      <AnimatePresence>
        {isCustomOpen && (
          <div id="custom-builder-backdrop" className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCustomOpen(false)} />

            <motion.div
              id="custom-builder-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header inside Modal with close button */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
                <div className="flex items-center space-x-2">
                  <span className="p-1 px-2.5 bg-[#800020]/10 text-[#800020] text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 leading-none">
                    <Sparkles className="w-3.5 h-3.5" /> CUSTOM
                  </span>
                  <h3 className="text-xs md:text-sm font-extrabold text-[#800020] uppercase tracking-wider">Kostumisasi Buket Kawat Bulu</h3>
                </div>
                <button
                  id="close-custom-builder-btn"
                  onClick={() => setIsCustomOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 bg-white">
                <CustomBuilder
                  onAddToCart={(product) => {
                    handleAddToCart(product);
                    setIsCustomOpen(false); // Auto close builder after successful insertion
                  }}
                  onOpenCart={() => {
                    setIsCartOpen(true);
                  }}
                  onClose={() => setIsCustomOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER PAGES SECURELY ACCORDING TO USER NAVIGATION */}
      {activeSection === 'admin' ? (
        <Dashboard
          products={products}
          categories={categories}
          orders={orders}
          testimonials={testimonials}
          settings={settings}
          onRefreshData={fetchData}
          user={user}
          onBackToShop={() => setActiveSection('catalog')}
        />
      ) : (
        <div id="client-workspace" className="space-y-0">
          
          {/* Hero Header Jumbotron */}
          <Hero
            onNavigateToCatalog={() => {
              const element = document.getElementById('catalog-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            title={settings.heroTitle}
            description={settings.heroDescription}
          />

          {/* Product Catalog list section */}
          <div id="catalog-anchor">
            <Catalog
              products={products}
              categories={categories}
              onAddToCart={handleAddToCart}
              onNavigateToCustom={() => setIsCustomOpen(true)}
            />
          </div>

          {/* Client Testimonials and submission segment */}
          <div id="testimonials-anchor" className={activeSection === 'testimonials' ? 'ring-2 ring-offset-4 ring-[#800020] rounded-2xl m-2' : ''}>
            <Testimonials
              testimonials={testimonials}
              onSubmitTestimonial={handleSubmitTestimonial}
            />
          </div>

          {/* Real-time Order Tracker status view */}
          <div id="tracker-anchor" className={activeSection === 'tracker' ? 'ring-2 ring-offset-4 ring-[#800020] rounded-2xl m-2' : ''}>
            <OrderTracker />
          </div>

        </div>
      )}

      {/* Aesthetic Brand Footer */}
      {activeSection !== 'admin' && (
        <footer id="brand-footer" className="bg-[#1F2937] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Logo description */}
            <div id="footer-branding" className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🌙</span>
                <span className="text-xl font-bold font-heading text-white">
                  Moon <span className="font-light text-gray-300">Bouquet</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
                Spesialis pembuatan buket bunga dari kawat bulu (chenille wire) premium nomor satu di Indonesia. Indah, awet, dan bermakna mendalam untuk setiap perayaan Anda.
              </p>
            </div>

            {/* Quick specifications */}
            <div id="footer-support" className="space-y-2 text-xs">
              <p className="font-bold uppercase tracking-wider text-gray-300">Hubungi Kami</p>
              <p className="text-gray-400">WhatsApp: <span className="text-[#FFFFFF]/90 font-bold">+{settings.whatsappNumber}</span></p>
              <p className="text-gray-400">Instagram: <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-white font-medium">@moon_bouquet</a></p>
              <p className="text-gray-400 font-light leading-normal">
                Alamat Fisik:<br/>
                {settings.shopAddress}
              </p>
            </div>

            {/* Copyright */}
            <div id="footer-copyright" className="text-xs text-gray-400 md:text-right space-y-1">
              <p className="font-semibold text-gray-300">© 2026 Moon Bouquet. All Rights Reserved.</p>
              <p className="font-light">Seni Florist Kawat Bulu Buatan Tangan Premium</p>
              <p className="text-[10px] text-gray-500 pt-1">Crafted with precise aesthetics & attention to details</p>
              <div className="pt-3">
                <button
                  id="admin-portal-link"
                  onClick={() => {
                    setActiveSection('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-1.5 text-gray-500 hover:text-white transition-all text-[11px] font-sans border border-gray-700 hover:border-gray-500 px-3 py-1 rounded-md cursor-pointer hover:bg-gray-800"
                >
                  <span>🔒 Portal Administrator</span>
                </button>
              </div>
            </div>

          </div>
        </footer>
      )}

    </div>
  );
}
