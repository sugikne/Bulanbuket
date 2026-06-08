import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, OrderItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number }[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  whatsappNumber: string;
  onPlaceOrder: (customerDetails: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    notes: string;
  }) => Promise<void>;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  whatsappNumber,
  onPlaceOrder
}: CartModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Mohon isi Formulir Pemesan secara lengkap.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save order details to Firestore
      await onPlaceOrder({
        customerName,
        customerPhone,
        customerAddress,
        notes
      });

      // 2. Generate detailed WhatsApp Template message
      const cleanedPhone = whatsappNumber.replace(/[^0-9]/g, '');
      const orderItemsText = cartItems
        .map(
          (item) =>
            `- *${item.product.name}* (x${item.quantity}) = ${formatPrice(
              item.product.price * item.quantity
            )}`
        )
        .join('%0A');

      const waText = 
`🌸 *MOON BOUQUET - INVOICE PEMESANAN* 🌸%0A%0A` +
`Halo Admin Moon Bouquet, saya ingin memesan buket bunga cantik berikut:%0A` +
`----------------------------------------%0A` +
`${orderItemsText}%0A` +
`----------------------------------------%0A` +
`⭐️ *Total Pembayaran:* ${formatPrice(totalAmount)}%0A%0A` +
`👤 *DETAIL PEMESAN:*%0A` +
`- Nama Lengkap: ${customerName}%0A` +
`- No. WhatsApp: ${customerPhone}%0A` +
`- Alamat Lengkap/Pengiriman: ${customerAddress}%0A` +
`- Catatan / Tulisan Kartu Ucapan: ${notes || '-'}%0A%0A` +
`Mohon diproses untuk pengiriman secepatnya. Terima kasih! ✨`;

      const waUrl = `https://wa.me/${cleanedPhone}?text=${waText}`;
      
      // Open WhatsApp in new tab securely
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      
      // Clear forms
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Error placed order', err);
      alert('Terjadi kesalahan saat memproses order. Silahkan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="cart-drawer-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          {/* Backdrop Closer */}
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

          <motion.div
            id="cart-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="bg-white w-full max-w-md h-full shadow-2xl relative z-10 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5.5 h-5.5 text-[#800020]" />
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Keranjang Belanja</h3>
                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-bold">
                  {cartItems.length} Item
                </span>
              </div>
              <button
                id="cart-close-btn"
                onClick={onClose}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5.5 h-5.5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Core Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div id="cart-empty-basket" className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#800020]/5 flex items-center justify-center text-2xl">
                    🛍️
                  </div>
                  <p className="text-gray-500 font-light text-base">Keranjang Anda masih kosong.</p>
                  <button
                    onClick={onClose}
                    className="bg-[#800020] text-white hover:bg-[#660018] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div id="cart-items-wrapper" className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detail Item Buket</p>
                    {cartItems.map((item) => (
                      <div
                        id={`cart-item-${item.product.id}`}
                        key={item.product.id}
                        className="flex items-center justify-between p-3 border border-gray-50 rounded-xl bg-gray-50/50"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 ml-3 select-none">
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-[#800020] font-semibold">{formatPrice(item.product.price)}</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center space-x-2 mr-3 bg-white border border-gray-100 rounded-lg p-0.5 shadow-xs">
                          <button
                            id={`qty-decrease-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-[#800020] disabled:opacity-30 cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-gray-700 min-w-4 text-center">{item.quantity}</span>
                          <button
                            id={`qty-increase-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-[#800020] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          id={`qty-remove-${item.product.id}`}
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Subtotals */}
                  <div id="cart-summary-invoice" className="border-t border-dashed border-gray-200 pt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Bahan & Packaging</span>
                      <span className="text-green-600 font-medium">GRATIS</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1.5">
                      <span>Total Biaya</span>
                      <span className="text-[#800020] font-black">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <form id="cart-checkout-form" onSubmit={handleCheckout} className="border-t border-gray-100 pt-4 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Formulir Pengiriman</p>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Nama Penerima/Pemesan</label>
                      <input
                        id="shipping-name-input"
                        type="text"
                        required
                        placeholder="Contoh: Riska Amalia"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Nomor WhatsApp Anda</label>
                      <input
                        id="shipping-phone-input"
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Alamat Lengkap Pengiriman</label>
                      <textarea
                        id="shipping-address-input"
                        required
                        rows={2}
                        placeholder="Contoh: Jl. Melati No. 12, Denpasar Timur, Bali (Dekat SMA 3)"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 flex items-center justify-between">
                        <span>Catatan / Ucapan Kartu</span>
                        <span className="text-[10px] text-gray-400 font-normal">Opsional</span>
                      </label>
                      <textarea
                        id="shipping-notes-input"
                        rows={2}
                        placeholder="Contoh: Tulis ucapan: 'Happy Graduation Riska!' dan warna kertas wrapping mau request merah muda..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition resize-none"
                      />
                    </div>

                    <button
                      id="cart-submit-checkout-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full py-3.5 tracking-widest uppercase flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 mt-4 cursor-pointer"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{isSubmitting ? 'Memproses...' : 'Kirim Pesanan Ke WhatsApp'}</span>
                    </button>
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">
                      🛍️ Bayar Aman & Mudah via Admin WhatsApp
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
