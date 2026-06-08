import React, { useState, useEffect } from 'react';
import {
  Lock, LayoutDashboard, Flower, ClipboardList, Star, Settings, LogOut,
  Plus, Edit, Trash2, Eye, ShieldCheck, DollarSign, Package, Check, X, Tag,
  Database, Cloud, Play, Key, Terminal, RefreshCw, Save, TrendingUp, TrendingDown, Copy
} from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Product, Category, Order, Testimonial, SystemSettings } from '../types';
import { 
  getSavedSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials,
  getSupabaseClient,
  addSupabaseCategory,
  deleteSupabaseCategory,
  addSupabaseProduct,
  updateSupabaseProduct,
  deleteSupabaseProduct,
  addSupabaseTestimonial,
  updateSupabaseTestimonialApproval,
  deleteSupabaseTestimonial,
  addSupabaseOrder,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  getSupabaseAdminEmail,
  updateSupabaseAdminEmail,
  getSupabaseSettings,
  updateSupabaseSettings,
  getSupabaseAdminConfig,
  updateSupabaseAdminConfig
} from '../lib/supabaseDb';

interface DashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  testimonials: Testimonial[];
  settings: SystemSettings;
  onRefreshData: () => void;
  user: User | null;
  onBackToShop?: () => void;
}

type TabType = 'dashboard' | 'products' | 'categories' | 'orders' | 'testimonials' | 'settings';

export default function Dashboard({
  products,
  categories,
  orders,
  testimonials,
  settings,
  onRefreshData,
  user,
  onBackToShop
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Form Fields for Product CRUD
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pCostPrice, setPCostPrice] = useState(0);
  const [pDesc, setPDesc] = useState('');
  const [pCat, setPCat] = useState('');
  const [pImage, setPImage] = useState('');
  const [pAvail, setPAvail] = useState(true);

  // Category CRUD Field
  const [newCatName, setNewCatName] = useState('');

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Settings CRUD Fields
  const [sPhone, setSPhone] = useState(settings.whatsappNumber);
  const [sAddress, setSAddress] = useState(settings.shopAddress);
  const [sInstagram, setSInstagram] = useState(settings.instagramUrl);
  const [sHeroTitle, setSHeroTitle] = useState(settings.heroTitle);
  const [sHeroDesc, setSHeroDesc] = useState(settings.heroDescription);

  useEffect(() => {
    setSPhone(settings.whatsappNumber);
    setSAddress(settings.shopAddress);
    setSInstagram(settings.instagramUrl);
    setSHeroTitle(settings.heroTitle);
    setSHeroDesc(settings.heroDescription);
  }, [settings]);

  // Single Authorized Admin Configurations (1 Admin Utama)
  const [authorizedEmail, setAuthorizedEmail] = useState("putusugianta2005@gmail.com");
  const [sAdminEmail, setSAdminEmail] = useState("putusugianta2005@gmail.com");
  const [adminPasscode, setAdminPasscode] = useState("moonadmin2026");
  const [sAdminPasscode, setSAdminPasscode] = useState("moonadmin2026");
  const [inputPasscode, setInputPasscode] = useState("");
  const [isPasscodeAuthorized, setIsPasscodeAuthorized] = useState(false);

  useEffect(() => {
    setSAdminEmail(authorizedEmail);
  }, [authorizedEmail]);

  useEffect(() => {
    setSAdminPasscode(adminPasscode);
  }, [adminPasscode]);

  // Supabase Connection Management States
  const [sbUrl, setSbUrl] = useState('');
  const [sbAnonKey, setSbAnonKey] = useState('');
  const [sbTestStatus, setSbTestStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSbTesting, setIsSbTesting] = useState(false);
  const [isShowingSqlSchema, setIsShowingSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch (e) {
      alert('Gagal menyalin otomatis. Silakan blok tulisan di bawah dan salin secara manual.');
    }
  };

  useEffect(() => {
    const saved = getSavedSupabaseCredentials();
    setSbUrl(saved.url);
    setSbAnonKey(saved.anonKey);

    // Dynamic Admin Config loading
    const fetchAdminConfig = async () => {
      try {
        const config = await getSupabaseAdminConfig();
        if (config) {
          setAuthorizedEmail(config.authorizedEmail);
          setAdminPasscode(config.adminPasscode);
        }
      } catch (err) {
        console.warn('Gagal memuat kredensial admin dari Supabase:', err);
      }
    };
    fetchAdminConfig();
  }, []);

  const handleSaveSbCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(sbUrl, sbAnonKey);
    alert('Kredensial Supabase berhasil disimpan di browser!');
  };

  const handleClearSbCredentials = () => {
    clearSupabaseCredentials();
    setSbUrl('');
    setSbAnonKey('');
    setSbTestStatus(null);
    alert('Kredensial Supabase lokal berhasil dihapus!');
  };

  const handleTestSbConnection = async () => {
    setIsSbTesting(true);
    setSbTestStatus(null);
    try {
      const result = await testSupabaseConnection({
        url: sbUrl,
        anonKey: sbAnonKey
      });
      setSbTestStatus(result);
    } catch (err: any) {
      setSbTestStatus({ success: false, msg: err.message || 'Gagal terhubung ke Supabase.' });
    } finally {
      setIsSbTesting(false);
    }
  };

  // Authorization Check
  const isAuthorized = (user && user.email === authorizedEmail) || isPasscodeAuthorized || isDemoMode;





  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Login Gagal. Mohon periksa kembali kredensial Anda atau gunakan opsi Passcode.');
    }
  };

  const handleDemoBypass = () => {
    setIsDemoMode(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsDemoMode(false);
    setIsPasscodeAuthorized(false);
    alert('Anda telah keluar dari Dashboard Administrator.');
    onRefreshData();
    if (onBackToShop) {
      onBackToShop();
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode.trim() === adminPasscode.trim()) {
      setIsPasscodeAuthorized(true);
      alert('Akses Admin berhasil dibuka menggunakan Passcode Keamanan!');
      onRefreshData();
    } else {
      alert('Passcode Keamanan salah! Silakan coba lagi.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // --- STATS CALCULATION ---
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalExpenses = completedOrders.reduce((accum, order) => {
    const orderCost = order.items.reduce((itemSum, item) => {
      const matched = products.find(p => p.id === item.productId);
      const itemCostPrice = item.costPrice ?? (matched?.costPrice ?? 0);
      return itemSum + (itemCostPrice * item.quantity);
    }, 0);
    return accum + orderCost;
  }, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingTestimonialsCount = testimonials.filter(t => !t.isApproved).length;

  // --- SETTINGS CRUD ACTION ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;
    try {
      const updatedSettings = {
        whatsappNumber: sPhone,
        shopAddress: sAddress,
        instagramUrl: sInstagram,
        heroTitle: sHeroTitle,
        heroDescription: sHeroDesc
      };

      // Always save to localStorage first as backup/offline storage
      localStorage.setItem('local_settings', JSON.stringify(updatedSettings));

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        try {
          await updateSupabaseSettings(updatedSettings);

          // Save admin email and passcode to Supabase if changed
          if (
            (sAdminEmail.trim() && sAdminEmail.trim().toLowerCase() !== authorizedEmail) ||
            (sAdminPasscode.trim() && sAdminPasscode.trim() !== adminPasscode)
          ) {
            const emailToSave = sAdminEmail.trim().toLowerCase();
            const passcodeToSave = sAdminPasscode.trim();
            await updateSupabaseAdminConfig(emailToSave, passcodeToSave);
            console.log('Admin email & passcode successfully synced to Supabase admin_settings!');
            setAuthorizedEmail(emailToSave);
            setAdminPasscode(passcodeToSave);
          }
          alert('Pengaturan Toko & Hak Akses Admin Tunggal berhasil diperbarui di database Supabase!');
        } catch (sbErr: any) {
          console.error('Failed to sync settings with Supabase:', sbErr);
          alert('Pengaturan disimpan SECARA LOKAL di browser Anda.\n\nCatatan: Aplikasi mendeteksi bahwa tabel "store_settings" belum dibuat di Supabase Anda. Silakan salin dan jalankan "SQL Schema" di SQL Editor Supabase Anda agar fitur sinkronisasi online aktif.');
        }
      } else {
        // Also apply local admin changes if not connected
        if (sAdminEmail.trim()) setAuthorizedEmail(sAdminEmail.trim().toLowerCase());
        if (sAdminPasscode.trim()) setAdminPasscode(sAdminPasscode.trim());
        alert('Pengaturan Toko berhasil diperbarui secara lokal! (Belum tersambung ke database Supabase)');
      }

      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyinkronkan pengaturan: ' + (err.message || err));
    }
  };

  // --- CATEGORIES CRUD ACTIONS ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !isAuthorized) return;
    try {
      const catId = 'cat-' + Date.now().toString(36);
      const slug = newCatName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const newCategory = { id: catId, name: newCatName.trim(), slug };
      
      // Always store locally first
      const savedCats = localStorage.getItem('local_categories');
      const localCats: Category[] = savedCats ? JSON.parse(savedCats) : [...categories];
      const updated = [...localCats, newCategory];
      localStorage.setItem('local_categories', JSON.stringify(updated));

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        try {
          await addSupabaseCategory(newCategory);
        } catch (sbErr: any) {
          console.warn('Gagal sync kategori ke Supabase:', sbErr);
          alert('Kategori berhasil disimpan secara lokal! (Gagal sync ke database Supabase: pastikan script SQL sudah dijalankan di Dashboard Supabase)');
        }
      }
      
      setNewCatName('');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan kategori: ' + (err.message || err));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAuthorized) return;
    triggerConfirm(
      'Hapus Kategori',
      'Apakah Anda yakin ingin menghapus kategori ini? Buket pada kategori ini akan kehilangan relasinya.',
      async () => {
        try {
          // Always delete locally first
          const savedCats = localStorage.getItem('local_categories');
          const localCats: Category[] = savedCats ? JSON.parse(savedCats) : [...categories];
          const updated = localCats.filter(c => c.id !== id);
          localStorage.setItem('local_categories', JSON.stringify(updated));

          const creds = getSavedSupabaseCredentials();
          const isSbConfigured = !!creds.url && !!creds.anonKey;

          if (isSbConfigured) {
            try {
              await deleteSupabaseCategory(id);
            } catch (sbErr: any) {
              console.warn('Gagal menghapus kategori di Supabase:', sbErr);
              alert('Kategori berhasil dihapus secara lokal! (Gagal menghapus di database Supabase: pastikan tabel categories sudah dibuat)');
            }
          }
          onRefreshData();
        } catch (err: any) {
          console.error(err);
          alert('Gagal menghapus kategori: ' + (err.message || err));
        }
      }
    );
  };

  // --- PRODUCTS CRUD ACTIONS ---
  const openAddProductModal = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice(0);
    setPCostPrice(0);
    setPDesc('');
    setPCat(categories[0]?.id || '');
    setPImage('https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=500&q=80');
    setPAvail(true);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setPName(p.name);
    setPPrice(p.price);
    setPCostPrice(p.costPrice || 0);
    setPDesc(p.description);
    setPCat(p.category);
    setPImage(p.image);
    setPAvail(p.isAvailable);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;
    try {
      const pId = editingProduct ? editingProduct.id : 'prod-' + Date.now().toString(36);
      const prData: Product = {
        id: pId,
        name: pName,
        price: Number(pPrice),
        costPrice: Number(pCostPrice),
        description: pDesc,
        category: pCat,
        image: pImage,
        isAvailable: pAvail,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
      };

      // Always save locally first
      const savedProds = localStorage.getItem('local_products');
      const localProds: Product[] = savedProds ? JSON.parse(savedProds) : [...products];
      let updated: Product[];
      if (editingProduct) {
        updated = localProds.map(p => p.id === pId ? prData : p);
      } else {
        updated = [...localProds, prData];
      }
      localStorage.setItem('local_products', JSON.stringify(updated));

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        try {
          if (editingProduct) {
            await updateSupabaseProduct(prData);
          } else {
            await addSupabaseProduct(prData);
          }
        } catch (sbErr: any) {
          console.warn('Gagal menyimpan ke Supabase:', sbErr);
          alert('Produk disimpan secara lokal! (Gagal sync ke database Supabase: pastikan script SQL sudah dijalankan di Dashboard Supabase)');
        }
      }

      setIsProductModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan produk: ' + (err.message || err));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAuthorized) return;
    triggerConfirm(
      'Hapus Produk',
      'Apakah Anda yakin ingin menghapus buket kawat bulu ini dari katalog?',
      async () => {
        try {
          // Always delete locally first
          const savedProds = localStorage.getItem('local_products');
          const localProds: Product[] = savedProds ? JSON.parse(savedProds) : [...products];
          const updated = localProds.filter(p => p.id !== id);
          localStorage.setItem('local_products', JSON.stringify(updated));

          const creds = getSavedSupabaseCredentials();
          const isSbConfigured = !!creds.url && !!creds.anonKey;

          if (isSbConfigured) {
            try {
              await deleteSupabaseProduct(id);
            } catch (sbErr: any) {
              console.warn('Gagal menghapus produk ke Supabase:', sbErr);
              alert('Produk berhasil dihapus secara lokal! (Gagal sync ke database Supabase: pastikan tabel products sudah dibuat)');
            }
          }
          onRefreshData();
        } catch (err: any) {
          console.error(err);
          alert('Gagal menghapus produk: ' + (err.message || err));
        }
      }
    );
  };

  // --- ORDERS STAGES ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!isAuthorized) return;
    try {
      // Always update locally first
      const savedOrders = localStorage.getItem('local_orders');
      const localOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [...orders];
      const updated = localOrders.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('local_orders', JSON.stringify(updated));

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        try {
          await updateSupabaseOrderStatus(orderId, status);
        } catch (sbErr: any) {
          console.warn('Gagal update status di Supabase:', sbErr);
          alert('Status pesanan diperbarui secara lokal! (Gagal sync ke database Supabase: pastikan tabel orders sudah dibuat)');
        }
      }
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengubah status order: ' + (err.message || err));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!isAuthorized) return;
    triggerConfirm(
      'Hapus Pesanan',
      'Apakah Anda yakin ingin menghapus slip order ini dari history database?',
      async () => {
        try {
          // Always delete locally first
          const savedOrders = localStorage.getItem('local_orders');
          const localOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [...orders];
          const updated = localOrders.filter(o => o.id !== orderId);
          localStorage.setItem('local_orders', JSON.stringify(updated));

          const creds = getSavedSupabaseCredentials();
          const isSbConfigured = !!creds.url && !!creds.anonKey;

          if (isSbConfigured) {
            try {
              await deleteSupabaseOrder(orderId);
            } catch (sbErr: any) {
              console.warn('Gagal menghapus order di Supabase:', sbErr);
              alert('Pesanan berhasil dihapus secara lokal! (Gagal menghapus di database Supabase: pastikan tabel orders sudah dibuat)');
            }
          }
          onRefreshData();
        } catch (err: any) {
          console.error(err);
          alert('Gagal menghapus pesanan: ' + (err.message || err));
        }
      }
    );
  };

  // --- TESTIMONIALS ACTIONS ---
  const handleApproveTestimonial = async (tId: string, isApproved: boolean) => {
    if (!isAuthorized) return;
    try {
      // Always update locally first
      const savedTests = localStorage.getItem('local_testimonials');
      const localTests: Testimonial[] = savedTests ? JSON.parse(savedTests) : [...testimonials];
      const updated = localTests.map(t => t.id === tId ? { ...t, isApproved } : t);
      localStorage.setItem('local_testimonials', JSON.stringify(updated));

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        try {
          await updateSupabaseTestimonialApproval(tId, isApproved);
        } catch (sbErr: any) {
          console.warn('Gagal menyetujui ulasan di Supabase:', sbErr);
          alert('Ulasan disetujui secara lokal! (Gagal sync ke database Supabase: pastikan tabel testimonials sudah dibuat)');
        }
      }
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      alert('Gagal memproses persetujuan ulasan: ' + (err.message || err));
    }
  };

  const handleDeleteTestimonial = async (tId: string) => {
    if (!isAuthorized) return;
    triggerConfirm(
      'Hapus Ulasan',
      'Apakah Anda yakin ingin membuang ulasan ini?',
      async () => {
        try {
          // Always delete locally first
          const savedTests = localStorage.getItem('local_testimonials');
          const localTests: Testimonial[] = savedTests ? JSON.parse(savedTests) : [...testimonials];
          const updated = localTests.filter(t => t.id !== tId);
          localStorage.setItem('local_testimonials', JSON.stringify(updated));

          const creds = getSavedSupabaseCredentials();
          const isSbConfigured = !!creds.url && !!creds.anonKey;

          if (isSbConfigured) {
            try {
              await deleteSupabaseTestimonial(tId);
            } catch (sbErr: any) {
              console.warn('Gagal menghapus ulasan di Supabase:', sbErr);
              alert('Ulasan berhasil dihapus secara lokal! (Gagal menghapus di database Supabase: pastikan tabel testimonials sudah dibuat)');
            }
          }
          onRefreshData();
        } catch (err: any) {
          console.error(err);
          alert('Gagal membuang ulasan: ' + (err.message || err));
        }
      }
    );
  };

  // --- RENDER LOGIN VIEW IF NOT LOGGED IN ---
  if (!isAuthorized) {
    return (
      <div id="admin-login-shield" className="min-h-[85vh] flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#800020]" />
          
          <div className="w-16 h-16 rounded-full bg-[#800020]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#800020]" />
          </div>

          <h3 className="text-xl font-bold font-heading text-center text-gray-900 mb-2">Portal Keamanan Admin</h3>
          <p className="text-xs text-gray-500 font-light text-center mb-6 leading-relaxed">
            Selamat datang di gerbang administrasi Moon Bouquet. Silakan masuk menggunakan Google Sign-In terdaftar atau masukkan Passcode Admin.
          </p>

          <div className="space-y-5">
            {/* OPSI 1: SIGN IN VIA GOOGLE */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metode 1: Google Administrator</span>
              <button
                id="google-signin-btn"
                onClick={handleLogin}
                className="w-full bg-[#800020] hover:bg-[#660018] text-white py-3 px-4 rounded-xl font-bold tracking-wide text-xs uppercase flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer duration-200"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In dengan Google</span>
              </button>
            </div>

            {/* DIVIDER OR */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="px-3 text-[10px] uppercase text-gray-400 font-bold tracking-widest">ATAU</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* OPSI 2: PASSCODE LOGIN */}
            <form onSubmit={handlePasscodeLogin} className="space-y-3">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metode 2: Kode PIN / Passcode</span>
              <div>
                <input
                  id="admin-passcode-input"
                  type="password"
                  placeholder="Ketik Passcode Keamanan Admin"
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold tracking-wide text-xs uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer duration-200"
              >
                <Key className="w-4 h-4" />
                <span>Masuk dengan Passcode</span>
              </button>
            </form>
          </div>

          {user && (
            <div className="mt-5 p-3 bg-red-50 text-red-700 text-[11px] rounded-xl font-medium leading-relaxed text-center">
              Email masuk "{user.email}" tidak terdaftar sebagai pemilik. Untuk login via Google, silakan ganti akun atau gunakan Passcode.
              <button onClick={() => signOut(auth)} className="underline block mx-auto mt-1 font-bold hover:text-red-900">Logout Akun Google</button>
            </div>
          )}

          {/* BACK TO SHOP BUTTON */}
          {onBackToShop && (
            <div className="mt-6 pt-4 border-t border-dashed border-gray-100 text-center">
              <button
                onClick={onBackToShop}
                className="text-xs text-gray-500 hover:text-[#800020] font-medium transition-colors cursor-pointer inline-flex items-center space-x-1"
              >
                <span>← Kembali ke Toko / Beranda</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-root" className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION - MAROON THEMED */}
      <aside className="w-full md:w-64 bg-[#800020] text-white flex flex-col justify-between py-8 px-6 md:min-h-screen shrink-0">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center space-x-2.5 border-b border-white/10 pb-6">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm">🌙</div>
            <div>
              <p className="font-extrabold text-lg tracking-tight">Moon Admin</p>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-[9px] text-[#FFFFFF]/70 tracking-wider font-semibold uppercase">Server Active</span>
              </div>
            </div>
          </div>

          {/* Nav Options */}
          <nav className="space-y-1.5">
            {[
              { label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
              { label: 'Buket Produk', icon: Flower, tab: 'products' },
              { label: 'Kategori', icon: Tag, tab: 'categories' },
              { label: 'Daftar Pesanan', icon: ClipboardList, tab: 'orders' },
              { label: 'Ulasan Testimoni', icon: Star, tab: 'testimonials' },
              { label: 'Pengaturan Toko', icon: Settings, tab: 'settings' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as TabType)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all cursor-pointer ${
                    activeTab === item.tab
                      ? 'bg-white text-[#800020] font-bold shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="pt-6 border-t border-white/10 mt-6 md:mt-0">
          <div className="flex items-center justify-between">
            <div className="max-w-44 truncate">
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Logged In As</p>
              <p className="text-xs font-bold text-white/95 truncate">{user?.email || 'Bypass Demo Admin'}</p>
            </div>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
        
        {/* --- DASHBOARD SUMMARY TAB --- */}
        {activeTab === 'dashboard' && (
          <div id="tab-dashboard" className="space-y-8 animate-fade-in">
            {/* Greetings bar */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 font-heading">Halo, Pengelola Toko 👋</h2>
              <p className="text-sm text-gray-600 font-light mt-0.5">Berikut rangkuman transaksi dan interaksi pada Moon Bouquet Anda hari ini.</p>
            </div>

            {/* Statistics Row Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#800020]/10 flex items-center justify-center text-[#800020] shrink-0">
                  <DollarSign className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Pendapatan Total</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1 leading-snug">{formatPrice(totalRevenue)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                  <TrendingDown className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Pengeluaran Total</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1 leading-snug">{formatPrice(totalExpenses)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <TrendingUp className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Keuntungan Estimasi</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1 leading-snug">{formatPrice(totalRevenue - totalExpenses)}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                  <ClipboardList className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Pesanan Antrian</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1 leading-snug">{pendingOrdersCount} Order</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Package className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Katalog Produk</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1 leading-snug">{products.length} Jenis</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                  <Star className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Saran Ulasan</p>
                  <p className="text-base font-extrabold text-gray-900 mt-1 leading-snug">{pendingTestimonialsCount} Antri</p>
                </div>
              </div>

            </div>

            {/* Simple Help Area Layout */}
            <div className="bg-[#800020]/5 border border-[#800020]/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-[#800020]">Sistem Link WhatsApp Florist</h4>
                <p className="text-xs text-gray-600 font-light max-w-2xl">
                  Setiap order masuk akan tersimpan di database dan secara bersamaan dikoordinasikan secara otomatis melalui link WhatsApp untuk konfirmasi pembayaran pemesan. Kelola status order pelan-pelan di panel untuk sinkronisasi pemesan pelacak.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="bg-[#800020] text-white hover:bg-[#660018] font-bold text-xs uppercase px-5 py-2.5 rounded-xl tracking-wider transition-all cursor-pointer"
              >
                Ganti Nomor WA Adm
              </button>
            </div>
          </div>
        )}

        {/* --- PRODUCTS MANAGER TAB --- */}
        {activeTab === 'products' && (
          <div id="tab-products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-heading">Katalog Buket Terdaftar</h2>
                <p className="text-sm text-gray-600 font-light mt-0.5">Kelola data buket kawat bulu, harga, gambar, serta ketersediaannya di katalog utama.</p>
              </div>
              <button
                id="add-prod-modal-trigger"
                onClick={openAddProductModal}
                className="bg-[#800020] hover:bg-[#660018] text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Tambah Buket</span>
              </button>
            </div>

            {/* Products Table list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Buket</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-gray-800 line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase">ID: #{p.id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-600">
                            {categories.find(c => c.id === p.category)?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#800020]">
                          {formatPrice(p.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.isAvailable ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {p.isAvailable ? 'Ready' : 'Pre-order'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-2 border border-gray-200 hover:border-[#800020] text-gray-600 hover:text-[#800020] rounded-xl transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- CATEGORIES MANAGER TAB --- */}
        {activeTab === 'categories' && (
          <div id="tab-categories" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 font-heading">Kategori Produk</h2>
              <p className="text-sm text-gray-600 font-light mt-0.5">Edit dan rancang kategori penapisan untuk katalog produk.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Form Input Category */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit">
                <h4 className="font-bold text-gray-800 text-sm mb-4">Tambahkan Kategori Baru</h4>
                <form id="add-category-form" onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Nama Kategori</label>
                    <input
                      id="cat-name-input"
                      type="text"
                      required
                      placeholder="Contoh: Graduation / Wisuda"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10"
                    />
                  </div>
                  <button
                    id="submit-category-btn"
                    type="submit"
                    className="w-full bg-[#800020] hover:bg-[#660018] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Kategori</span>
                  </button>
                </form>
              </div>

              {/* Categories Display list */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <h4 className="font-bold text-gray-800 text-sm mb-4">Daftar Kategori</h4>
                <div className="divide-y divide-gray-100">
                  {categories.map((c) => (
                    <div key={c.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-gray-800">{c.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Slug: {c.slug}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 border border-red-50 hover:bg-red-50 text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ORDERS MANAGER TAB --- */}
        {activeTab === 'orders' && (
          <div id="tab-orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 font-heading">Daftar Transaksi / Order Masuk</h2>
              <p className="text-sm text-gray-600 font-light mt-0.5">Kelola alur penyusunan pesanan kawat bulu pemesan, beri respon tahapan pembuatan.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Nomor Order</th>
                      <th className="px-6 py-4">Nama Pelanggan</th>
                      <th className="px-6 py-4">Keranjang Belanja</th>
                      <th className="px-6 py-4">Status & Ganti Tahap</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400 font-light">Belum ada order pemesan masuk saat ini.</td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-bold text-gray-800">#{o.id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400">
                              {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString('id-ID') : new Date(o.createdAt).toLocaleString('id-ID')}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800">{o.customerName}</p>
                            <p className="text-xs text-gray-500 leading-normal">{o.customerPhone}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-1" title={o.customerAddress}>{o.customerAddress}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {o.items.map((item, id) => (
                                <p key={id} className="text-xs text-gray-600 font-medium">
                                  {item.name} <span className="font-bold text-gray-400">x{item.quantity}</span>
                                </p>
                              ))}
                              <p className="font-black text-sm text-[#800020] mt-1 pr-4">{formatPrice(o.totalAmount)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                              className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 focus:outline-none"
                            >
                              <option value="pending">Antrian (Pending)</option>
                              <option value="processed">Dirangkai (Processed)</option>
                              <option value="completed">Selesai / Dikirim (Completed)</option>
                              <option value="cancelled">Batal (Cancelled)</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="p-2 border border-red-50 hover:bg-red-50 text-red-500 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TESTIMONIAL MODERATION TAB --- */}
        {activeTab === 'testimonials' && (
          <div id="tab-testimonials" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 font-heading">Moderasi Ulasan Testimoni</h2>
              <p className="text-sm text-gray-600 font-light mt-0.5">Tinjau dan setujui ulasan pemesan sebelum ditayangkan di halaman utama toko.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Pengirim</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Deskripsi Pesan</th>
                      <th className="px-6 py-4">Moderasi</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                    {testimonials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400 font-light">Belum ada testimoni masuk.</td>
                      </tr>
                    ) : (
                      testimonials.map((t) => (
                        <tr key={t.id}>
                          <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                            {t.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex text-yellow-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-gray-600 max-w-sm font-light leading-relaxed">"{t.text}"</p>
                          </td>
                          <td className="px-6 py-4">
                            {t.isApproved ? (
                              <button
                                onClick={() => handleApproveTestimonial(t.id, false)}
                                className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 text-xs font-bold rounded-lg transition"
                              >
                                Berjalan Terpajang
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveTestimonial(t.id, true)}
                                className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100 text-xs font-bold rounded-lg transition"
                              >
                                Setujui / Pajang
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="p-2 border border-red-50 hover:bg-red-50 text-red-500 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- SYSTEM SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div id="tab-settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 font-heading">Sistem Pengaturan Toko</h2>
              <p className="text-sm text-gray-600 font-light mt-0.5">Ubah rincian dasar kontak admin, instagram, dan rincian jumbotron secara terpusat.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-3xl">
              <form id="settings-update-form" onSubmit={handleSaveSettings} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Nomor WhatsApp Admin (Checkout)</label>
                    <input
                      id="update-wa-phone"
                      type="text"
                      required
                      value={sPhone}
                      onChange={(e) => setSPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400">Gunakan format kode negara, contoh: 6281234567890</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Alamat URL Instagram</label>
                    <input
                      id="update-ig-url"
                      type="text"
                      required
                      value={sInstagram}
                      onChange={(e) => setSInstagram(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Alamat Fisik Toko</label>
                  <textarea
                    id="update-shop-address"
                    required
                    rows={2}
                    value={sAddress}
                    onChange={(e) => setSAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="border-t border-dashed border-gray-100 pt-5 space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kustomisasi Beranda/Hero</p>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Judul Utama / Tagline</label>
                    <input
                      id="update-hero-title"
                      type="text"
                      required
                      value={sHeroTitle}
                      onChange={(e) => setSHeroTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Deskripsi Tagline</label>
                    <textarea
                      id="update-hero-desc"
                      required
                      rows={3}
                      value={sHeroDesc}
                      onChange={(e) => setSHeroDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-100 pt-5 space-y-4">
                  <p className="text-xs font-bold text-[#800020] uppercase tracking-widest flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#800020]" />
                    <span>Keamanan & Hak Akses Admin Tunggal</span>
                  </p>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Email Utama Pemilik (Admin Tunggal)</label>
                    <input
                      id="update-admin-email"
                      type="email"
                      required
                      value={sAdminEmail}
                      onChange={(e) => setSAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400 leading-normal">
                      *Hak akses panel dashboard florist ini hanya diberikan kepada satu email pemilik saja demi menjaga tingkat keamanan data terbaik. Jika Anda mengubah email ini, pastikan email baru adalah akun Google aktif karena sistem akan mengunci akses email saat ini setelah disimpan.
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-semibold text-gray-600">Passcode / PIN Keamanan Admin Baru</label>
                    <input
                      id="update-admin-passcode"
                      type="text"
                      required
                      value={sAdminPasscode}
                      onChange={(e) => setSAdminPasscode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none font-mono font-bold"
                    />
                    <p className="text-[10px] text-gray-400 leading-normal">
                      *Masukkan passcode aman yang sulit ditebak. Passcode ini digunakan sebagai alternatif masuk yang aman selain dengan Google Authentication. Sifatnya rahasia, silakan diganti secara berkala.
                    </p>
                  </div>
                </div>

                <button
                  id="submit-settings-btn"
                  type="submit"
                  className="bg-[#800020] hover:bg-[#660018] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </form>
            </div>

            {/* Supabase Integration Settings Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-3xl mt-8">
              <div className="flex items-center space-x-3 mb-5 border-b border-dashed border-gray-100 pb-4 font-sans">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Integrasi Database Utama Supabase (PostgreSQL SQL)</h3>
                  <p className="text-xs text-gray-500 font-light">Hubungkan situs florist dengan database SQL relasional Supabase.</p>
                </div>
              </div>

              {/* Status Server Detection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-150/60 font-sans">
                <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400">SUPABASE URL STATUS</span>
                  {sbUrl ? (
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-md">Terpasang</span>
                  ) : (
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-md">Kosong</span>
                  )}
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400">SUPABASE ANON KEY STATUS</span>
                  {sbAnonKey ? (
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-md">Terpasang</span>
                  ) : (
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-md">Kosong</span>
                  )}
                </div>
              </div>

              {/* Credentials Overwrite Form */}
              <form onSubmit={handleSaveSbCredentials} className="space-y-4 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1">
                      <Cloud className="w-3 h-3 text-gray-400" />
                      <span>Supabase URL API Endpoint</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://your-id.supabase.co"
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#800020]/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1">
                      <Key className="w-3 h-3 text-gray-400" />
                      <span>Supabase Anon Key (Public)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan Anon public key Supabase Anda"
                      value={sbAnonKey}
                      onChange={(e) => setSbAnonKey(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#800020]/20"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-normal font-sans">
                  💡 <strong>Dua Cara Menghubungkan Supabase:</strong><br />
                  1. <strong>Melalui Form ini (Disimpan lokal di browser):</strong> Masukkan URL dan Anon Key di atas lalu klik tombol simpan.<br />
                  2. <strong>Melalui Environment Variables (Sangat Direkomendasikan untuk Publik):</strong> Anda juga bisa menaruh kredensial ini langsung di file <code>.env</code> proyek Anda menggunakan variabel <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> agar seluruh pembeli situs dapat langsung terhubung secara otomatis tanpa perlu setup manual di browser masing-masing.
                </p>

                {/* Connection Test Status Displays */}
                {sbTestStatus && (
                  <div className={`p-4 rounded-xl border ${sbTestStatus.success ? 'bg-green-500/10 border-green-200 text-green-700' : 'bg-rose-500/10 border-rose-200 text-rose-700'} text-xs font-medium leading-relaxed flex items-start space-x-2`}>
                    <span>{sbTestStatus.success ? '✅' : '❌'}</span>
                    <p className="font-light">{sbTestStatus.msg}</p>
                  </div>
                )}

                {/* Operations Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-100">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition shadow-xs cursor-pointer"
                  >
                    Simpan Setelan Supabase
                  </button>
                  { (sbUrl || sbAnonKey) && (
                    <button
                      type="button"
                      onClick={handleClearSbCredentials}
                      className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold uppercase tracking-wider text-[10px] transition cursor-pointer"
                    >
                      Hapus Simpanan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleTestSbConnection}
                    disabled={isSbTesting}
                    className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSbTesting ? 'animate-spin' : ''}`} />
                    <span>Uji Koneksi (Test SQL Queries)</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsShowingSqlSchema(!isShowingSqlSchema)}
                    className="px-4 py-2 bg-[#800020]/10 text-[#800020] hover:bg-[#800020]/20 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5 transition cursor-pointer ml-auto"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>{isShowingSqlSchema ? 'Sembunyikan SQL Schema' : 'Lihat SQL Schema'}</span>
                  </button>
                </div>
              </form>

              {/* Collapsible SQL Schema Viewer */}
              {isShowingSqlSchema && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gray-900 rounded-2xl border border-gray-800 text-white font-mono text-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                    <span className="text-gray-400 text-xs font-sans">SQL Table Definitions Schema (Supabase)</span>
                    <button 
                      onClick={handleCopySql}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-[10px] uppercase font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Schema</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="max-h-60 overflow-y-auto text-pink-400 leading-normal selection:bg-pink-700 selection:text-white p-2 bg-[#0D1117] rounded-xl text-[11px]">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                  <p className="mt-3 text-[10px] text-gray-400 leading-normal font-sans">
                    💡 Salin kode di atas, buka menu <span className="text-gray-200 font-semibold">SQL Editor</span> di dasbor Supabase Anda, buat query baru, paste skema ini, lalu jalankan (Run). Meja data SQL akan terbuat sempurna dalam 1 detik!
                  </p>
                </motion.div>
              )}

              {/* Troubleshooting and Instructions Manual */}
              <div className="mt-8 pt-6 border-t border-gray-100 bg-amber-50/50 -mx-8 -mb-8 p-8 rounded-b-3xl font-sans font-light">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-700" />
                  <span>Panduan Setup Database Supabase Florist</span>
                </h4>
                
                <div className="space-y-4 text-xs text-amber-900/80 leading-relaxed font-light">
                  <div className="bg-white p-4 rounded-xl border border-amber-200/40 shadow-xs">
                    <p className="font-bold text-amber-950 mb-1 font-sans">1. Cara Mendapatkan URL & Anon Key:</p>
                    <p className="mb-2">
                      Supabase menyediakan kredensial endpoint ini secara gratis di bawah menu Settings proyek Anda:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-1 text-amber-950/95 font-medium font-sans">
                      <li>Buka dasbor proyek <span className="underline">Supabase</span> Anda.</li>
                      <li>Di panel navigasi sebelah kiri, klik ikon gerigi (<span className="font-bold">Project Settings</span>) kemudian pilih sub-menu <span className="font-bold">API</span>.</li>
                      <li>Salin URL di bagian <span className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">Project URL</span> dan masukkan ke field di atas.</li>
                      <li>Salin Public Key di bagian <span className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">Project API keys &gt; anon / public</span> dan masukkan ke field Anon Key di atas.</li>
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200/40 shadow-xs">
                    <p className="font-bold text-amber-950 mb-1 font-sans">2. Memulai (Inisialisasi Tabel Postgres SQL):</p>
                    <p className="mb-2">
                       Agar website dapat mencocokkan query pesanan ke database SQL Supabase, Anda perlu menuangkan tabelnya terlebih dahulu (hanya sekali saja):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-1 text-amber-950/95 font-sans font-normal">
                      <li>Klik button <span className="bg-[#800020]/10 text-[#800020] px-1 rounded text-[10px] font-bold">Lihat SQL Schema</span> di atas, kemudian klik <span className="font-semibold text-[#800020]">Salin Schema</span>.</li>
                      <li>Masuk ke dasbor Supabase Anda, cari dan klik menu <span className="font-bold font-sans">SQL Editor</span> di navigasi kiri (ikon terminal <code className="font-mono bg-gray-100 px-1 rounded font-semibold text-gray-700 font-sans">&gt;_</code>).</li>
                      <li>Tekan <span className="font-medium font-sans">New Query</span>, tempel (paste) script SQL yang Anda salin ke lembar editor, dan tekan button <span className="bg-emerald-600 font-sans text-white font-bold px-1.5 py-0.5 rounded text-[11px]">Run</span> di bagian kanan bawah. Selesai!</li>
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200/40 shadow-xs">
                    <p className="font-bold text-amber-950 mb-1 font-sans">3. Mode Cadangan Otomatis (Firestore Fallback):</p>
                    <p className="font-sans">
                      Jika integrasi Supabase belum tersambung, sistem digital florist Anda murni **akan beroperasi menggunakan Google Firestore bawaan**. Ini mencegah downtime agar para pelanggan florist Anda selalu dapat memesan karangan bunga kapan saja tanpa hambatan!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- PRODUCT CRUD INTERACTIVE MODAL POPOVER --- */}
      {isProductModalOpen && (
        <div id="product-crud-modal" className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative border border-gray-100"
          >
            {/* Header */}
            <div className="px-6 py-4.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-extrabold text-gray-900 tracking-tight text-base">
                {editingProduct ? 'Ubah Informasi Buket' : 'Tambahkan Buket Baru'}
              </h4>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 px-2.5 hover:bg-gray-100 text-gray-500 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form id="product-upsert-form" onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Nama Buket</label>
                <input
                  id="product-input-name"
                  type="text"
                  required
                  placeholder="Contoh: Red Velvet Bouquet"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Harga Jual (Rupiah)</label>
                  <input
                    id="product-input-price"
                    type="number"
                    required
                    placeholder="Contoh: 185000"
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 font-medium">Harga Pengeluaran / Modal (Rupiah)</label>
                  <input
                    id="product-input-cost-price"
                    type="number"
                    required
                    placeholder="Contoh: 120000"
                    value={pCostPrice}
                    onChange={(e) => setPCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Kategori Buket</label>
                  <select
                    id="product-input-category"
                    value={pCat}
                    onChange={(e) => setPCat(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Ketersediaan Stok</label>
                  <div className="flex items-center space-x-2 pt-2.5">
                    <input
                      id="product-input-avail"
                      type="checkbox"
                      checked={pAvail}
                      onChange={(e) => setPAvail(e.target.checked)}
                      className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                    />
                    <span className="text-xs text-gray-600 font-medium">Buket Ready / Sedia</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Foto Buket</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-150">
                  <div className="shrink-0">
                    {pImage ? (
                      <div className="relative group">
                        <img 
                          src={pImage} 
                          alt="Pratinjau Buket" 
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200/80 shadow-xs" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setPImage('')}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-xs transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <Cloud className="w-6 h-6 stroke-1.25" />
                        <span className="text-[9px] mt-1">Belum ada</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label 
                      htmlFor="product-file-image" 
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#800020] rounded-xl px-4 py-3 cursor-pointer text-center bg-white hover:bg-gray-50 transition shadow-2xs"
                    >
                      <Plus className="w-4 h-4 text-[#800020] mb-0.5" />
                      <span className="text-xs font-bold text-gray-700">Pilih / Seret Foto</span>
                      <span className="text-[9px] text-gray-400 font-medium mt-0.5">Format JPG/PNG/WEBP (Otomatis Kompresi)</span>
                      <input
                        id="product-file-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 500;
                                const MAX_HEIGHT = 500;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  // Compress to JPEG with 0.75 quality for small size & high visual fidelity
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                                  setPImage(dataUrl);
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Spesifikasi & Deskripsi Singkat</label>
                <textarea
                  id="product-input-desc"
                  required
                  rows={4}
                  placeholder="Sebutkan detail jumlah mawar kawat bulu, pelengkap wrapping, sedia warna apa saja..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-wider transition hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="product-save-submit"
                  type="submit"
                  className="px-6 py-2.5 bg-[#800020] hover:bg-[#660018] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition cursor-pointer shadow-md"
                >
                  Simpan Buket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dynamic Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div id="confirm-modal-overlay" className="fixed inset-0 bg-black/65 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#800020]" />
            <h4 id="confirm-modal-title" className="text-base font-bold text-gray-900 mb-2">{confirmModal.title}</h4>
            <p id="confirm-modal-msg" className="text-xs text-gray-500 leading-relaxed font-light mb-6">{confirmModal.message}</p>
            
            <div className="flex space-x-2.5 justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 bg-[#800020] hover:bg-[#660018] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-sm"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
