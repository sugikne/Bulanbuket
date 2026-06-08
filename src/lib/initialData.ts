import bouquetRoseRed from '../assets/images/bouquet_rose_red_1780653519699.png';
import bouquetTulipLavender from '../assets/images/bouquet_tulip_lavender_1780653539769.png';
import bouquetSunflowerGrad from '../assets/images/bouquet_sunflower_grad_1780653556957.png';
import { Product, Category, Testimonial, SystemSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-wisuda', name: 'Graduation / Wisuda', slug: 'wisuda' },
  { id: 'cat-romantic', name: 'Romantic & Anniversary', slug: 'romantic' },
  { id: 'cat-birthday', name: 'Birthday & Celebration', slug: 'birthday' },
  { id: 'cat-cute', name: 'Cute & Miniature', slug: 'cute' }
];

export const INITIAL_PRODUCTS: Omit<Product, 'createdAt'>[] = [
  {
    id: 'prod-rose-premium',
    name: 'Red Velvet Rose Bouquet',
    price: 185000,
    description: 'Buket bunga mawar murni berwarna merah velvet berbalut kemasan satin premium. Dibuat dengan kawat bulu (chenille wire) berkualitas tinggi yang awet sepanjang masa. Hadiah sempurna untuk merayakan hari jadi, ungkapan cinta, atau lamaran.',
    category: 'cat-romantic',
    image: bouquetRoseRed,
    isAvailable: true
  },
  {
    id: 'prod-tulip-lavender',
    name: 'Aesthetic Lavender Tulip Bouquet',
    price: 155000,
    description: 'Buket bunga tulip warna lavender pastel dan putih salju yang segar, dihias cantik dengan wrapping spunbond krem bertekstur. Cocok untuk hadiah ulang tahun sahabat, wisuda kelulusan, atau dekorasi minimalis di meja kerja.',
    category: 'cat-birthday',
    image: bouquetTulipLavender,
    isAvailable: true
  },
  {
    id: 'prod-sunflower-grad',
    name: 'Sunshine Sunflower Graduation',
    price: 195000,
    description: 'Buket bunga matahari cerah dipadukan dengan bunga aster mungil handmade. Dibungkus bernuansa biru langit mewah yang elegan, sangat cocok untuk momen kelulusan, wisuda, atau penyemangat meraih cita-cita.',
    category: 'cat-wisuda',
    image: bouquetSunflowerGrad,
    isAvailable: true
  }
];

export const INITIAL_TESTIMONIALS: Omit<Testimonial, 'createdAt'>[] = [
  {
    id: 'test-1',
    name: 'Riska Amalia',
    rating: 5,
    text: 'Buketnya rapi banget! Detail kawat bulunya mewah, lembut, dan warnanya persis foto catalog. Beli buat wisuda temen, dia seneng banget karena bunganya ga akan layu.',
    isApproved: true
  },
  {
    id: 'test-2',
    name: 'Andra Wijaya',
    rating: 5,
    text: 'Sangat recommended untuk hadiah pacar. Respon admin lewat WhatsApp cepet dan ramah banget. Pembayaran gampang dan bisa custom kartu ucapan.',
    isApproved: true
  },
  {
    id: 'test-3',
    name: 'Siti Rahma',
    rating: 4,
    text: 'Cantik sekali mawar merahnya! Kemasannya kencang dan tebal, pengiriman ke luar kota juga aman pakai kardus. Next time order lagi di Moon Bouquet.',
    isApproved: true
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  whatsappNumber: '6281234567890',
  shopAddress: 'Jl. Melati No. 12, Denpasar Timur, Bali',
  instagramUrl: 'https://instagram.com/moon_bouquet',
  heroTitle: 'Buket Handmade yang Unik, Cantik, dan Berkesan',
  heroDescription: 'Temukan pilihan buket kawat bulu premium yang tak lekang oleh waktu untuk kado wisuda, kekasih, ulang tahun, dan pelengkap setiap hari istimewa Anda.'
};
