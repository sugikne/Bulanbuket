import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, OrderItem, Testimonial, SystemSettings } from '../types';

// Retrieve credentials from localStorage or Vite environment variables
export function getSavedSupabaseCredentials() {
  const url = localStorage.getItem('sb_url') || (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const anonKey = localStorage.getItem('sb_anon_key') || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem('sb_url', url.trim());
  localStorage.setItem('sb_anon_key', anonKey.trim());
}

export function clearSupabaseCredentials() {
  localStorage.removeItem('sb_url');
  localStorage.removeItem('sb_anon_key');
}

// Global cached client instance
let cachedSbClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedAnonKey = '';

export function getSupabaseClient(customCreds?: { url?: string; anonKey?: string }): SupabaseClient | null {
  const creds = customCreds || getSavedSupabaseCredentials();
  
  if (!creds.url || !creds.anonKey) {
    return null;
  }

  try {
    // If credentials changed or not cached, instantiate new one
    if (
      !cachedSbClient ||
      creds.url !== cachedUrl ||
      creds.anonKey !== cachedAnonKey
    ) {
      cachedSbClient = createClient(creds.url, creds.anonKey, {
        auth: {
          persistSession: false
        }
      });
      cachedUrl = creds.url;
      cachedAnonKey = creds.anonKey;
    }
    return cachedSbClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// SQL Schema for copying to Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- SALIN DAN TEMPEL SCRIPT INI DI SQL EDITOR SUPABASE ANDA

-- 1. Tabel Kategori
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL
);

-- 2. Tabel Produk
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  "costPrice" NUMERIC,
  description TEXT,
  category TEXT,
  image TEXT,
  "isAvailable" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Testimonial/Ulasan
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  "isApproved" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Orders (Pesanan Utama)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerAddress" TEXT NOT NULL,
  "totalAmount" NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Order Items (Detail Item Pesanan)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  "costPrice" NUMERIC,
  quantity INTEGER NOT NULL
);

-- 6. Tabel Admin Settings (Hanya mengizinkan maks 1 Admin Tunggal)
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  "authorizedEmail" TEXT NOT NULL,
  "adminPasscode" TEXT NOT NULL DEFAULT 'moonadmin2026',
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Masukkan admin default jika tabel masih kosong
INSERT INTO admin_settings (id, "authorizedEmail", "adminPasscode")
VALUES (1, 'putusugianta2005@gmail.com', 'moonadmin2026')
ON CONFLICT (id) DO NOTHING;

-- 7. Tabel Pengaturan Toko (Hanya mengizinkan maks 1 pengaturan toko tunggal)
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  "whatsappNumber" TEXT NOT NULL,
  "shopAddress" TEXT NOT NULL,
  "instagramUrl" TEXT NOT NULL,
  "heroTitle" TEXT NOT NULL,
  "heroDescription" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Masukkan pengaturan toko default jika tabel masih kosong
INSERT INTO store_settings (id, "whatsappNumber", "shopAddress", "instagramUrl", "heroTitle", "heroDescription")
VALUES (
  1, 
  '6281234567890', 
  'Jl. Melati No. 12, Denpasar Timur, Bali', 
  'https://instagram.com/moon_bouquet', 
  'Buket Handmade yang Unik, Cantik, dan Berkesan', 
  'Temukan pilihan buket kawat bulu premium yang tak lekang oleh waktu untuk kado wisuda, kekasih, ulang tahun, dan pelengkap setiap hari istimewa Anda.'
)
ON CONFLICT (id) DO NOTHING;

-- Izinkan akses publik baca/tulis tanpa RLS (Row Level Security) demi penyederhanaan admin situs:
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;
`;

// Helper to check table existence/schema
export async function testSupabaseConnection(customCreds?: { url?: string; anonKey?: string }): Promise<{ success: boolean; msg: string }> {
  const client = getSupabaseClient(customCreds);
  if (!client) {
    return { success: false, msg: 'Supabase URL atau Anon Key belum dikonfigurasi.' };
  }

  try {
    // Attempt pointing to Categories to see if credentials and tables are valid
    const { data, error } = await client.from('categories').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "categories" does not exist')) {
        return { 
          success: true, 
          msg: 'Koneksi ke Supabase berhasil! Namun, tabel database belum dibuat. Silakan salin "SQL Schema" dan jalankan di SQL Editor Supabase Anda.' 
        };
      }
      throw error;
    }
    
    return { success: true, msg: 'Sukses terhubung! Berhasil membaca data dari tabel Supabase.' };
  } catch (error: any) {
    console.error('Supabase test connection failed:', error);
    return { success: false, msg: error.message || 'Gagal terhubung ke Supabase.' };
  }
}

// 1. Categories CRUD
export async function getSupabaseCategories(): Promise<Category[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addSupabaseCategory(category: Category): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('categories')
    .insert([{
      id: category.id,
      name: category.name,
      slug: category.slug
    }]);

  if (error) throw error;
}

export async function deleteSupabaseCategory(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 2. Products CRUD
export async function getSupabaseProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { data, error } = await client
    .from('products')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    costPrice: r.costPrice !== null && r.costPrice !== undefined ? Number(r.costPrice) : undefined,
    description: r.description || '',
    category: r.category || '',
    image: r.image || '',
    isAvailable: r.isAvailable === true || r.isAvailable === 1 || r.isAvailable === 'true',
    createdAt: r.createdAt
  }));
}

export async function addSupabaseProduct(product: Product): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('products')
    .insert([{
      id: product.id,
      name: product.name,
      price: product.price,
      costPrice: product.costPrice || 0,
      description: product.description,
      category: product.category,
      image: product.image,
      isAvailable: !!product.isAvailable,
      createdAt: product.createdAt || new Date().toISOString()
    }]);

  if (error) throw error;
}

export async function updateSupabaseProduct(product: Product): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('products')
    .update({
      name: product.name,
      price: product.price,
      costPrice: product.costPrice || 0,
      description: product.description,
      category: product.category,
      image: product.image,
      isAvailable: !!product.isAvailable
    })
    .eq('id', product.id);

  if (error) throw error;
}

export async function deleteSupabaseProduct(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 3. Testimonials CRUD
export async function getSupabaseTestimonials(): Promise<Testimonial[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { data, error } = await client
    .from('testimonials')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    rating: Number(r.rating),
    text: r.text || '',
    isApproved: r.isApproved === true || r.isApproved === 1 || r.isApproved === 'true',
    createdAt: r.createdAt
  }));
}

export async function addSupabaseTestimonial(testimonial: Testimonial): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('testimonials')
    .insert([{
      id: testimonial.id,
      name: testimonial.name,
      rating: testimonial.rating,
      text: testimonial.text,
      isApproved: !!testimonial.isApproved,
      createdAt: testimonial.createdAt || new Date().toISOString()
    }]);

  if (error) throw error;
}

export async function updateSupabaseTestimonialApproval(id: string, isApproved: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('testimonials')
    .update({ isApproved })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteSupabaseTestimonial(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 4. Orders and OrderItems CRUD
export async function getSupabaseOrders(): Promise<Order[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  // Fetch orders
  const { data: orderData, error: orderError } = await client
    .from('orders')
    .select('*')
    .order('createdAt', { ascending: false });

  if (orderError) throw orderError;

  // Fetch order items
  const { data: itemData, error: itemError } = await client
    .from('order_items')
    .select('*');

  if (itemError) throw itemError;

  // Group items by orderId
  const itemsByOrderId: { [orderId: string]: OrderItem[] } = {};
  (itemData || []).forEach((row: any) => {
    const item: OrderItem = {
      productId: row.productId,
      name: row.name,
      price: Number(row.price),
      costPrice: row.costPrice !== null && row.costPrice !== undefined ? Number(row.costPrice) : undefined,
      quantity: Number(row.quantity)
    };
    if (!itemsByOrderId[row.orderId]) {
      itemsByOrderId[row.orderId] = [];
    }
    itemsByOrderId[row.orderId].push(item);
  });

  return (orderData || []).map((r: any) => ({
    id: r.id,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerAddress: r.customerAddress,
    totalAmount: Number(r.totalAmount),
    status: r.status as Order['status'],
    notes: r.notes || '',
    createdAt: r.createdAt,
    items: itemsByOrderId[r.id] || []
  }));
}

export async function trackSupabaseOrdersByPhone(phone: string): Promise<Order[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const sanitizedPhone = phone.trim();

  // Fetch orders matching phone
  const { data: orderData, error: orderError } = await client
    .from('orders')
    .select('*')
    .eq('customerPhone', sanitizedPhone)
    .order('createdAt', { ascending: false });

  if (orderError) throw orderError;
  if (!orderData || orderData.length === 0) return [];

  const orderIds = orderData.map((r: any) => r.id);

  // Fetch order items matching these orders
  const { data: itemData, error: itemError } = await client
    .from('order_items')
    .select('*')
    .in('orderId', orderIds);

  if (itemError) throw itemError;

  const itemsByOrderId: { [orderId: string]: OrderItem[] } = {};
  (itemData || []).forEach((row: any) => {
    const item: OrderItem = {
      productId: row.productId,
      name: row.name,
      price: Number(row.price),
      costPrice: row.costPrice !== null && row.costPrice !== undefined ? Number(row.costPrice) : undefined,
      quantity: Number(row.quantity)
    };
    if (!itemsByOrderId[row.orderId]) {
      itemsByOrderId[row.orderId] = [];
    }
    itemsByOrderId[row.orderId].push(item);
  });

  return orderData.map((r: any) => ({
    id: r.id,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerAddress: r.customerAddress,
    totalAmount: Number(r.totalAmount),
    status: r.status as Order['status'],
    notes: r.notes || '',
    createdAt: r.createdAt,
    items: itemsByOrderId[r.id] || []
  }));
}

export async function addSupabaseOrder(order: Order): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  // 1. Insert into orders metadata table
  const { error: orderError } = await client
    .from('orders')
    .insert([{
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: order.totalAmount,
      status: order.status,
      notes: order.notes || '',
      createdAt: order.createdAt || new Date().toISOString()
    }]);

  if (orderError) throw orderError;

  // 2. Insert order items
  const itemInserts = order.items.map((item) => {
    const itemId = 'item-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
    return {
      id: itemId,
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      costPrice: item.costPrice || 0,
      quantity: item.quantity
    };
  });

  const { error: itemsError } = await client
    .from('order_items')
    .insert(itemInserts);

  if (itemsError) throw itemsError;
}

export async function updateSupabaseOrderStatus(id: string, status: Order['status']): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteSupabaseOrder(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  // Deleting order itself will auto cascaded order_items if foreign keys are setup with ON DELETE CASCADE.
  // We perform an explicit items delete on order_items first anyway for standard security.
  const { error: itemsError } = await client
    .from('order_items')
    .delete()
    .eq('orderId', id);

  if (itemsError) throw itemsError;

  const { error: orderError } = await client
    .from('orders')
    .delete()
    .eq('id', id);

  if (orderError) throw orderError;
}

export async function getSupabaseAdminEmail(): Promise<string> {
  const client = getSupabaseClient();
  if (!client) return 'putusugianta2005@gmail.com';

  try {
    const { data, error } = await client
      .from('admin_settings')
      .select('authorizedEmail')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn('Gagal membaca email admin dari Supabase:', error.message);
      return 'putusugianta2005@gmail.com';
    }

    return data?.authorizedEmail || 'putusugianta2005@gmail.com';
  } catch (err) {
    console.warn('Supabase admin email read fallback:', err);
    return 'putusugianta2005@gmail.com';
  }
}

export async function updateSupabaseAdminEmail(email: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('admin_settings')
    .upsert({
      id: 1,
      authorizedEmail: email.trim().toLowerCase(),
      updatedAt: new Date().toISOString()
    });

  if (error) throw error;
}

export async function getSupabaseAdminConfig(): Promise<{ authorizedEmail: string; adminPasscode: string }> {
  const client = getSupabaseClient();
  const fallback = { authorizedEmail: 'putusugianta2005@gmail.com', adminPasscode: 'moonadmin2026' };
  if (!client) return fallback;

  try {
    const { data, error } = await client
      .from('admin_settings')
      .select('authorizedEmail, adminPasscode')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn('Gagal membaca admin_settings (mungkin adminPasscode belum didefinisikan, mencoba query authorizedEmail saja):', error.message);
      const { data: oldData, error: oldErr } = await client
        .from('admin_settings')
        .select('authorizedEmail')
        .eq('id', 1)
        .single();
      
      if (!oldErr && oldData) {
        return {
          authorizedEmail: oldData.authorizedEmail,
          adminPasscode: 'moonadmin2026'
        };
      }
      return fallback;
    }

    return {
      authorizedEmail: data?.authorizedEmail || fallback.authorizedEmail,
      adminPasscode: data?.adminPasscode || fallback.adminPasscode
    };
  } catch (err) {
    console.warn('Supabase admin info fallback:', err);
    return fallback;
  }
}

export async function updateSupabaseAdminConfig(email: string, passcode: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('admin_settings')
    .upsert({
      id: 1,
      authorizedEmail: email.trim().toLowerCase(),
      adminPasscode: passcode.trim(),
      updatedAt: new Date().toISOString()
    });

  if (error) throw error;
}

export async function getSupabaseSettings(): Promise<SystemSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn('Gagal membaca store_settings dari Supabase:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      whatsappNumber: data.whatsappNumber,
      shopAddress: data.shopAddress,
      instagramUrl: data.instagramUrl,
      heroTitle: data.heroTitle,
      heroDescription: data.heroDescription
    };
  } catch (err) {
    console.warn('Gagal membaca store_settings:', err);
    return null;
  }
}

export async function updateSupabaseSettings(settings: SystemSettings): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not initialized');

  const { error } = await client
    .from('store_settings')
    .upsert({
      id: 1,
      whatsappNumber: settings.whatsappNumber.trim(),
      shopAddress: settings.shopAddress.trim(),
      instagramUrl: settings.instagramUrl.trim(),
      heroTitle: settings.heroTitle.trim(),
      heroDescription: settings.heroDescription.trim(),
      updatedAt: new Date().toISOString()
    });

  if (error) throw error;
}


