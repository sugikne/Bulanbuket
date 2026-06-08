import React, { useState } from 'react';
import { Star, MessageSquareCode, Send, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
  onSubmitTestimonial: (name: string, rating: number, text: string, phone: string) => Promise<void>;
}

export default function Testimonials({ testimonials, onSubmitTestimonial }: TestimonialsProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter only approved testimonials for the client view
  const approvedTestimonials = testimonials.filter((t) => t.isApproved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitTestimonial(name, rating, text, phone);
      setName('');
      setPhone('');
      setText('');
      setRating(5);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting feedback: ', err);
      alert(err.message || 'Gagal mengirimkan ulasan. Silahkan hubungi admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="testimonials-section" className="bg-white py-10 md:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 space-y-2 md:space-y-3">
          <span className="text-[#800020] font-bold text-xs md:text-sm tracking-widest uppercase">TESTIMONI PELANGGAN</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Apa Kata Mereka?
          </h2>
          <div className="w-12 md:w-16 h-1 bg-[#800020] mx-auto rounded-full" />
          <p className="text-xs md:text-sm text-gray-500 font-light mt-1.5 md:mt-2 px-2">
            Melihat suka cita pelanggan menceritakan kebahagiaan saat menerima buket bunga kawat bulu kami.
          </p>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* Left Block: Interactive Testimonial Cards */}
          <div id="testimonials-gird-panel" className="lg:col-span-7 space-y-4 md:space-y-6">
            {approvedTestimonials.length === 0 ? (
              <div id="testimonials-empty-space" className="bg-gray-50 p-8 md:p-12 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs md:text-sm">
                Belum ada testimoni terpajang. Tulis ulasan pertama Anda untuk toko kami!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {approvedTestimonials.map((t) => (
                  <motion.div
                    id={`testimonial-card-${t.id}`}
                    key={t.id}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#F8F9FA] p-5 md:p-6 rounded-2xl border border-gray-100/50 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2 md:space-y-3">
                      {/* Star Stars Rating */}
                      <div className="flex text-yellow-400 space-x-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 ${
                              i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 font-light italic leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2.5 pt-3.5 border-t border-gray-100/30 mt-3.5">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#800020]/10 flex items-center justify-center font-bold text-xs md:text-sm text-[#800020]">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{t.name}</p>
                        <p className="text-[10px] text-gray-400">Terverifikasi Pembeli</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Block: Fast Testimony Submission Form */}
          <div id="testimony-submission-form-container" className="lg:col-span-5">
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[24px] border border-gray-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#800020]" />
              
              <div className="flex items-center space-x-2.5 mb-6">
                <BookmarkCheck className="w-6 h-6 text-[#800020]" />
                <h3 className="text-lg font-bold text-gray-900">Kirim Ulasan Anda</h3>
              </div>

              {/* Alert Status Notification Template */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    id="testimonial-success-alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl mb-6 font-semibold"
                  >
                    Terima kasih! Ulasan berhasil dikirimkan. Admin akan meninjau dan mempublikasikannya segera di beranda. ✨
                  </motion.div>
                )}
              </AnimatePresence>

              <form id="submit-feedback-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Nama Lengkap</label>
                  <input
                    id="testimonial-author-name"
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-600">Nomor Telepon saat Memesan</label>
                    <span className="text-[10px] text-[#800020] font-semibold bg-[#800020]/5 px-2 py-0.5 rounded-full">Verifikasi Pembeli</span>
                  </div>
                  <input
                    id="testimonial-author-phone"
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition font-mono"
                  />
                  <p className="text-[10px] text-gray-400 font-sans leading-normal">
                    *Hanya pembeli terverifikasi yang diperbolehkan memberi ulasan. Nomor Anda digunakan otomatis oleh sistem untuk memverifikasi pesanan Anda.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Beri Rating Bintang</label>
                  <div className="flex space-x-1.5 pt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starVal = i + 1;
                      return (
                        <button
                          id={`star-btn-${starVal}`}
                          key={i}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="text-gray-200 hover:text-yellow-400 transition-colors focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              starVal <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Pesan Ulasan</label>
                  <textarea
                    id="testimonial-content-text"
                    required
                    rows={4}
                    placeholder="Ceritakan pengalaman Anda membeli buket flower di Moon Bouquet..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/10 focus:border-[#800020]/25 transition resize-none"
                  />
                </div>

                <button
                  id="testimonial-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 text-xs tracking-widest uppercase flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
