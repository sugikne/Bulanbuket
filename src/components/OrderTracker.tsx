import React, { useState } from 'react';
import { Search, Loader2, Calendar, ClipboardCheck, Clock, CheckCircle, AlertTriangle, PhoneCall } from 'lucide-react';
import { getSavedSupabaseCredentials, trackSupabaseOrdersByPhone } from '../lib/supabaseDb';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function OrderTracker() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    setSearched(true);
    setErrorMessage('');
    try {
      let results: Order[] = [];

      const creds = getSavedSupabaseCredentials();
      const isSbConfigured = !!creds.url && !!creds.anonKey;

      if (isSbConfigured) {
        results = await trackSupabaseOrdersByPhone(phoneNumber.trim());
      } else {
        const savedOrders = localStorage.getItem('local_orders');
        const localOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [];
        results = localOrders.filter(o => o.customerPhone.trim() === phoneNumber.trim());
      }

      results.sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      
      setOrders(results);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal melacak pesanan. Silakan periksa koneksi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Dalam Antrean',
          color: 'bg-amber-50 text-amber-700 border-amber-100/80',
          stepIndex: 1,
          description: 'Pesanan Anda sudah masuk dan menunggu giliran dirangkai.'
        };
      case 'processed':
        return {
          label: 'Sedang Dirangkai',
          color: 'bg-blue-50 text-blue-700 border-blue-100/80',
          stepIndex: 2,
          description: 'Florist kami sedang merangkai buket bunga pesanan Anda.'
        };
      case 'completed':
        return {
          label: 'Selesai & Dikirim',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
          stepIndex: 3,
          description: 'Buket bunga cantik Anda selesai dirangkai dan dalam perjalanan.'
        };
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          color: 'bg-rose-50 text-rose-700 border-rose-100/80',
          stepIndex: 4,
          description: 'Pesanan ini telah dibatalkan. Hubungi admin untuk detail lebih lanjut.'
        };
      default:
        return {
          label: 'Belum Diproses',
          color: 'bg-gray-50 text-gray-700 border-gray-100',
          stepIndex: 0,
          description: 'Status pesanan belum diperbarui.'
        };
    }
  };

  const getProgressBarWidth = (status: Order['status']) => {
    if (status === 'cancelled') return 'w-full bg-rose-300';
    if (status === 'completed') return 'w-full bg-emerald-500';
    if (status === 'processed') return 'w-2/3 bg-blue-500';
    return 'w-1/3 bg-amber-500';
  };

  return (
    <section id="tracker-section" className="bg-gray-50/50 py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100/40">
      <div className="max-w-3xl mx-auto">
        
        {/* Title and Intro */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-[#800020] font-black text-xs tracking-widest uppercase bg-[#800020]/5 px-3 py-1 rounded-full">STATUS LAJU</span>
          <h2 className="text-2xl md:text-3.5xl font-black text-gray-900 tracking-tight leading-none">Lacak Pesanan Anda</h2>
          <p className="text-gray-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
            Masukkan nomor WhatsApp yang Anda daftarkan saat memesan guna memantau perkembangan pembuatan buket Anda secara realtime.
          </p>
        </div>

        {/* Polished Compact Tracking Form */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] max-w-lg mx-auto mb-10">
          <form id="track-order-form" onSubmit={handleTrack} className="space-y-3">
            <div className="relative flex items-center">
              <PhoneCall className="absolute left-3.5 text-gray-400 w-4.5 h-4.5" />
              <input
                id="tracker-phone-input"
                type="text"
                required
                placeholder="Masukkan nomor WA (Contoh: 0812345678)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-11 pr-3.5 py-3 bg-gray-50/80 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition font-mono tracking-wide"
              />
            </div>
            
            <button
              id="tracker-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#800020] hover:bg-[#600018] active:scale-[0.99] text-white text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-[0_4px_12px_rgba(128,0,32,0.15)] hover:shadow-[0_6px_20px_rgba(128,0,32,0.25)] transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cek Status Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results Wrapper */}
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              id="tracker-results-wrapper"
              className="space-y-6"
            >
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#800020]" />
                </div>
              ) : errorMessage ? (
                <div id="tracker-error-alert" className="bg-amber-50/40 p-6 md:p-8 rounded-2xl border border-amber-100/80 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-gray-700 font-bold text-sm md:text-base">Gagal Melacak</p>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-md mx-auto">{errorMessage}</p>
                </div>
              ) : orders.length === 0 ? (
                <div id="tracker-not-found" className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-900 font-extrabold text-sm md:text-base">Riwayat tidak ditemukan</p>
                    <p className="text-gray-400 text-xs leading-normal max-w-md mx-auto">
                      Kami tidak menemukan pesanan aktif untuk nomor <span className="font-mono text-gray-700 font-bold bg-gray-50 px-1.5 py-0.5 rounded">{phoneNumber}</span>. Segera checkout kembali bouquet impian Anda sekarang juga!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Ditemukan {orders.length} Pemesanan
                    </p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    
                    return (
                      <div
                        id={`tracked-order-card-${order.id}`}
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.05)]"
                      >
                        {/* Elegant Header of Card */}
                        <div className="p-5 bg-gray-50/50 border-b border-gray-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] text-[#800020] font-black bg-[#800020]/5 px-2 py-0.5 rounded">BUKET ORDER</span>
                              <span className="text-xs font-mono font-bold text-gray-700">#{order.id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-gray-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium">
                                {(order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt)).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          <span className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Beautiful Timeline Steps Progress */}
                        <div className="p-5 md:p-6 border-b border-gray-50">
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Laju Progres Pembuatan</span>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">{statusInfo.description}</p>
                          </div>

                          {/* Stepper with visual animated bar line */}
                          <div className="relative pt-4 pb-2">
                            {/* Inner custom illuminated track bar line */}
                            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-1 bg-gray-150 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-700 ease-out ${getProgressBarWidth(order.status)}`} />
                            </div>

                            <div className="grid grid-cols-4 relative">
                              {/* Dipesan / Pending */}
                              <div className="flex flex-col items-center text-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  order.status !== 'cancelled'
                                    ? 'bg-amber-50 text-amber-600 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                                    : 'bg-gray-50 text-gray-300 border-gray-150'
                                }`}>
                                  <ClipboardCheck className="w-4 h-4" />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 ${order.status !== 'cancelled' ? 'text-gray-800' : 'text-gray-400'}`}>Dipesan</span>
                              </div>

                              {/* Dirangkai / Processed */}
                              <div className="flex flex-col items-center text-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  order.status === 'processed' || order.status === 'completed'
                                    ? 'bg-blue-50 text-blue-600 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                                    : 'bg-gray-50 text-gray-300 border-gray-150'
                                }`}>
                                  <Clock className="w-4 h-4 animate-pulse" />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 ${order.status === 'processed' || order.status === 'completed' ? 'text-gray-800' : 'text-gray-400'}`}>Dirangkai</span>
                              </div>

                              {/* Dikirim / Selesai */}
                              <div className="flex flex-col items-center text-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  order.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                                    : 'bg-gray-50 text-gray-300 border-gray-150'
                                }`}>
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 ${order.status === 'completed' ? 'text-gray-800' : 'text-gray-400'}`}>Dikirim</span>
                              </div>

                              {/* Batal / Cancelled */}
                              <div className="flex flex-col items-center text-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  order.status === 'cancelled'
                                    ? 'bg-rose-50 text-rose-600 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                                    : 'bg-gray-50 text-gray-300 border-gray-150'
                                }`}>
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                                <span className={`text-[10px] font-bold mt-2 ${order.status === 'cancelled' ? 'text-rose-600' : 'text-gray-400'}`}>Batal</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Details Accordion Block */}
                        <div className="p-5 md:p-6 bg-gray-50/30">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3.5 block">Item & Rincian Total</span>
                          
                          <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-xs md:text-sm">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="text-gray-700 font-medium font-sans">
                                  {item.name} <span className="text-gray-400 text-xs font-bold ml-1">x{item.quantity}</span>
                                </div>
                                <div className="font-bold text-gray-900 font-mono">{formatPrice(item.price * item.quantity)}</div>
                              </div>
                            ))}
                            
                            <div className="pt-3 flex justify-between items-center text-sm md:text-base font-black border-t border-dashed border-gray-150 mt-1">
                              <span className="text-gray-800">Total Tagihan</span>
                              <span className="text-[#800020] font-mono">{formatPrice(order.totalAmount)}</span>
                            </div>
                          </div>

                          {/* Address Info Segment */}
                          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100/80 pt-4 text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-gray-400 uppercase tracking-wider">Nama & Alamat Penerima</p>
                              <p className="font-extrabold text-gray-800">{order.customerName}</p>
                              <p className="text-gray-500 font-medium leading-relaxed mt-0.5">{order.customerAddress}</p>
                            </div>
                            
                            {order.notes && (
                              <div className="space-y-1">
                                <p className="font-bold text-gray-400 uppercase tracking-wider">Pesan Ucapan / Keterangan</p>
                                <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/50 text-gray-600 italic font-medium leading-normal">
                                  "{order.notes}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
