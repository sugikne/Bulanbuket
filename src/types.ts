export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  description: string;
  category: string;
  image: string;
  isAvailable: boolean;
  createdAt: any; // Timestamp or date ISO string
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  costPrice?: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: any; // Timestamp or date ISO string
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  isApproved: boolean;
  createdAt: any; // Timestamp or date ISO string
}

export interface SystemSettings {
  whatsappNumber: string;
  shopAddress: string;
  instagramUrl: string;
  heroTitle: string;
  heroDescription: string;
}
