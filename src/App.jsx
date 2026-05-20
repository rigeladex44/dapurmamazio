import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard,
  UtensilsCrossed,
  PackageSearch,
  Receipt,
  Wallet,
  Plus,
  Minus,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Home,
  QrCode,
  Bell,
  Store,
  History,
  ShoppingBag,
  Printer,
  X,
  Banknote,
  Filter,
  Calendar,
  Pencil,
  Utensils,
  Trash2,
  Upload
} from 'lucide-react';

// Helper untuk inisial nama menu (contoh: "Mie Level" -> "ML")
const getInitials = (name) => {
  if (!name) return 'M';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// ==========================================
// KONSTANTA
// ==========================================
const PURCHASE_CATEGORIES = [
  'Bahan Baku',
  'Minuman Sachet & Es',
  'Kemasan & Plastik',
  'Operasional (Listrik/Gas)',
  'Lain-lain'
];

// ==========================================
// KOMPONEN TOAST (Notifikasi)
// ==========================================
const Toast = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-xl shadow-lg text-white transform transition-all duration-300 z-50 animate-in slide-in-from-bottom-5 ${type === 'error' ? 'bg-red-700' : 'bg-gray-900'}`}>
      {type === 'error' ? <AlertCircle className="mr-2" size={20} /> : <CheckCircle2 className="mr-2" size={20} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

// ==========================================
// VIEW: KASIR (POS)
// ==========================================
const POSView = ({ menus, cart, setCart, onCheckout }) => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');

  const [cashGiven, setCashGiven] = useState('');

  const categories = ['Semua', ...new Set(menus.map(m => m.category))];
  const filteredMenus = activeCategory === 'Semua' ? menus : menus.filter(m => m.category === activeCategory);

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const change = (parseInt(cashGiven) || 0) - total;

  const addToCart = (menu) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item => item.id === menu.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'Tunai' && (parseInt(cashGiven) || 0) < total) return;

    const transactionId = `TRX-${Math.floor(Math.random() * 1000000)}`;
    const dateStr = new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const actualCash = paymentMethod === 'QRIS' ? total : parseInt(cashGiven);
    const actualChange = paymentMethod === 'QRIS' ? 0 : change;

    setReceiptData({
      id: transactionId,
      date: dateStr,
      items: [...cart],
      total: total,
      cash: actualCash,
      change: actualChange,
      paymentMethod: paymentMethod
    });

    onCheckout(total, cart, paymentMethod);
    setCheckoutModal(false);
    setCashGiven('');
    setPaymentMethod('Tunai');
  };

  const handleCloseReceipt = () => {
    setReceiptData(null);
    setCart([]);
  };

  const handlePrintReceipt = () => {
    alert("Proses mencetak ke Printer Thermal Bluetooth/USB...\n(Fitur ini akan terhubung dengan Hardware di aplikasi native)");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 pb-20 md:pb-0 animate-in fade-in duration-300 items-start relative">

      {/* 1. Modal Pembayaran (Checkout) */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Banknote className="text-red-700" /> Proses Pembayaran</h3>
              <button onClick={() => setCheckoutModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-200">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total Tagihan</span>
                <span className="text-3xl font-black text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaymentMethod('Tunai')} className={`py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Tunai' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}><Banknote size={18} /> Tunai</button>
                <button onClick={() => setPaymentMethod('QRIS')} className={`py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${paymentMethod === 'QRIS' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}><QrCode size={18} /> QRIS</button>
              </div>

              {paymentMethod === 'Tunai' ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nominal Uang Diterima</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                      <input
                        type="number"
                        className="w-full pl-12 pr-4 py-3 text-xl font-bold bg-white border-2 border-gray-200 rounded-xl focus:border-red-600 outline-none transition-colors"
                        placeholder="0"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setCashGiven(total.toString())} className="py-2 px-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Uang Pas</button>
                    <button onClick={() => setCashGiven('50000')} className="py-2 px-1 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:border-gray-300 transition-colors">Rp 50.000</button>
                    <button onClick={() => setCashGiven('100000')} className="py-2 px-1 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:border-gray-300 transition-colors">Rp 100.000</button>
                  </div>

                  {parseInt(cashGiven) > 0 && (
                    <div className={`p-4 rounded-xl flex justify-between items-center ${change >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <span className={`font-bold text-sm ${change >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        {change >= 0 ? 'Kembalian' : 'Uang Kurang'}
                      </span>
                      <span className={`text-xl font-black ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        Rp {Math.abs(change).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center justify-center text-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <p className="font-bold text-blue-900">Pembayaran Non-Tunai (QRIS)</p>
                    <p className="text-xs text-blue-700 mt-1">Minta pelanggan scan kode QR di bawah untuk tagihan <b>Rp {total.toLocaleString('id-ID')}</b></p>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-48 h-48 flex items-center justify-center overflow-hidden">
                    <img
                      src="qris.png"
                      alt="QRIS Dapur Pedas"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=qris-placeholder";
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mt-1">A.N. DAPUR PEDAS MAMA ZIO</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleProcessPayment}
                disabled={paymentMethod === 'Tunai' && (parseInt(cashGiven) || 0) < total}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={20} /> Selesaikan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Struk Pembayaran (Digital Receipt) */}
      {receiptData && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center">

            {/* Kertas Struk */}
            <div className="w-full bg-white p-6 font-mono text-gray-800 relative shadow-[0_0_15px_rgba(0,0,0,0.1)]">

              {/* Penempatan Logo pada Struk Thermal (Grayscale) */}
              <div className="text-center mb-5 border-b-2 border-dashed border-gray-300 pb-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-white flex items-center justify-center overflow-hidden mb-3 grayscale contrast-125 brightness-110 mix-blend-multiply">
                  <img
                    src="/logo.png"
                    alt="Logo Mama Zio"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <h2 className="text-lg font-black tracking-tighter mb-1">DAPUR PEDAS MAMA ZIO</h2>
                <p className="text-xs text-gray-500 leading-snug">Spesialis Dimsum & Pedasan<br />Kucur Klampok, Dau, Kab Malang, Jawa Timur</p>
              </div>

              <div className="text-[10px] mb-4 flex justify-between text-gray-600">
                <div>
                  <p>Wkt: {receiptData.date.split(',')[1]}</p>
                  <p>Tgl: {receiptData.date.split(',')[0]}</p>
                </div>
                <div className="text-right">
                  <p>ID: {receiptData.id}</p>
                  <p>Opr: Mama'e Zio</p>
                </div>
              </div>

              <div className="border-b-2 border-dashed border-gray-300 pb-2 mb-2">
                {receiptData.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs mb-2">
                    <div className="flex-1 pr-2">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.qty} x {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="font-bold text-right">{(item.price * item.qty).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between font-black text-sm pt-1">
                  <span>TOTAL</span>
                  <span>Rp {receiptData.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>METODE</span>
                  <span className="font-bold">{receiptData.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>DIBAYAR</span>
                  <span>Rp {receiptData.cash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>KEMBALI</span>
                  <span>Rp {receiptData.change.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                <p className="text-[10px] font-bold uppercase tracking-widest">TERIMA KASIH</p>
                <p className="text-[9px] text-gray-500 mt-1">Layanan Kritik & Saran: WA: +62 856-0863-5849</p>
              </div>
            </div>

            {/* Aksi Struk */}
            <div className="w-full p-4 bg-gray-100 flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-white border border-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 text-sm"
              >
                <Printer size={16} /> Cetak
              </button>
              <button
                onClick={handleCloseReceipt}
                className="flex-1 bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-800 transition-colors flex justify-center items-center gap-2 text-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA KASIR --- */}
      <div className="w-full md:w-[65%] lg:w-[70%]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-900">Katalog Menu</h2>
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-red-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {filteredMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => addToCart(menu)}
              className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm hover:border-red-500 hover:shadow transition-all flex flex-col text-left gap-1.5 active:scale-[0.98] group h-full"
            >
              <div className={`w-full aspect-[4/3] rounded-md flex items-center justify-center text-white ${menu.image ? 'bg-gray-100' : menu.color} shadow-inner group-hover:opacity-90 transition-opacity overflow-hidden`}>
                {menu.image ? (
                  <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="text-2xl font-black tracking-widest opacity-80 group-hover:scale-110 transition-transform duration-300">{getInitials(menu.name)}</span>
                )}
              </div>
              <div className="mt-auto w-full pt-1">
                <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">{menu.category}</p>
                <h3 className="font-bold text-gray-800 leading-tight group-hover:text-red-700 transition-colors text-[11px] mb-1 line-clamp-2">{menu.name}</h3>
                <p className="text-red-700 font-black text-xs">Rp {menu.price.toLocaleString('id-ID')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-[35%] lg:w-[30%] flex-shrink-0 md:sticky md:top-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[450px] md:h-[calc(100vh-8rem)] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="text-red-700" size={16} /> Rincian Pesanan
            </h2>
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md">{totalItems} Item</span>
          </div>

          <div className="flex-1 overflow-y-auto p-0 bg-white">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 p-6 text-center">
                <PackageSearch size={36} className="opacity-20" />
                <p className="text-xs font-medium">Belum ada menu dipilih.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="p-3 flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-gray-800 text-xs leading-tight max-w-[70%]">{item.name}</h4>
                      <p className="text-gray-900 font-bold text-xs whitespace-nowrap">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400 font-medium">@ Rp {item.price.toLocaleString('id-ID')}</p>
                      <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 shadow-sm p-0.5">
                        <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:bg-gray-100 hover:text-red-600 p-1 rounded transition-colors"><Minus size={12} /></button>
                        <span className="font-bold text-gray-800 text-xs w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:bg-gray-100 hover:text-green-600 p-1 rounded transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-semibold text-xs">Total Tagihan</span>
              <span className="text-xl font-black text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={() => setCheckoutModal(true)}
              disabled={cart.length === 0}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm"
            >
              <Receipt size={16} /> Bayar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VIEW: CATAT BELANJA (PENGELUARAN)
// ==========================================
const PurchaseView = ({ finances, onRecordPurchase }) => {
  const [formData, setFormData] = useState({ category: '', note: '', amount: '' });
  const expenses = finances.filter(f => f.type === 'expense');
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) return;
    onRecordPurchase(formData.category, formData.note, parseFloat(formData.amount));
    setFormData({ category: '', note: '', amount: '' });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 pb-20 md:pb-0 animate-in fade-in duration-300 items-start relative">
      <div className="w-full md:w-[65%] lg:w-[70%] space-y-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0"><TrendingDown size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Pengeluaran / Belanja</p>
            <h3 className="text-xl font-black text-gray-900">Rp {totalExpense.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><History size={16} className="text-gray-500" /> Riwayat Belanja Bahan</h3>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Keterangan / Item</th><th className="px-5 py-3 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {[...expenses].reverse().map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-500">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] border border-gray-200">{item.category}</span></td>
                    <td className="px-5 py-3 text-gray-700">{item.note || '-'}</td>
                    <td className="px-5 py-3 text-right font-bold text-red-600">- Rp {item.amount.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (<tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400 text-xs">Belum ada riwayat belanja tercatat.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[35%] lg:w-[30%] flex-shrink-0 md:sticky md:top-0">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><ShoppingBag className="text-red-700" size={16} /> Form Pengeluaran</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kategori Belanja</label>
              <select className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">-- Pilih Kategori --</option>
                {PURCHASE_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Keterangan Barang</label>
              <input type="text" placeholder="Cth: Beli Ayam 5kg, Sayur dll..." className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Biaya (Rp)</label>
              <input type="number" placeholder="Total uang keluar" className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg shadow-sm transform active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm"><Plus size={16} /> Simpan Pengeluaran</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// VIEW: LAPORAN KEUANGAN (DENGAN FILTER)
// ==========================================
const FinanceView = ({ finances, onEditTransaction }) => {
  const [filterPeriod, setFilterPeriod] = useState('semua');
  const [editingTrx, setEditingTrx] = useState(null);
  const [editForm, setEditForm] = useState({ type: '', category: '', note: '', amount: '', paymentMethod: 'Tunai' });

  const handleOpenEdit = (trx) => {
    setEditingTrx(trx.id);
    setEditForm({
      type: trx.type,
      category: trx.category,
      note: trx.note,
      amount: trx.amount,
      paymentMethod: trx.paymentMethod || 'Tunai'
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    onEditTransaction({
      id: editingTrx,
      type: editForm.type,
      category: editForm.category,
      note: editForm.note,
      amount: parseFloat(editForm.amount),
      paymentMethod: editForm.type === 'income' ? editForm.paymentMethod : undefined
    });
    setEditingTrx(null);
  };

  const filteredFinances = finances.filter(f => {
    const trxDate = new Date(f.date);
    const now = new Date();

    if (filterPeriod === 'hari_ini') {
      return trxDate.toDateString() === now.toDateString();
    }
    if (filterPeriod === 'bulan_ini') {
      return trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalIncome = filteredFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = filteredFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-10">

      {editingTrx && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Pencil className="text-blue-600" /> Edit Transaksi</h3>
              <button type="button" onClick={() => setEditingTrx(null)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tipe Transaksi</label>
                  <select className="w-full p-3 text-sm bg-white border border-gray-300 rounded-xl focus:border-blue-500 outline-none transition-all" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} required>
                    <option value="income">Pemasukan (+)</option>
                    <option value="expense">Pengeluaran (-)</option>
                  </select>
                </div>
                {editForm.type === 'income' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Pembayaran</label>
                    <select className="w-full p-3 text-sm bg-white border border-gray-300 rounded-xl focus:border-blue-500 outline-none transition-all" value={editForm.paymentMethod} onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })} required>
                      <option value="Tunai">Tunai</option>
                      <option value="QRIS">QRIS</option>
                    </select>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Kategori</label>
                <input type="text" className="w-full p-3 text-sm bg-white border border-gray-300 rounded-xl focus:border-blue-500 outline-none transition-all" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Keterangan</label>
                <input type="text" className="w-full p-3 text-sm bg-white border border-gray-300 rounded-xl focus:border-blue-500 outline-none transition-all" value={editForm.note} onChange={e => setEditForm({ ...editForm, note: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nominal (Rp)</label>
                <input type="number" className="w-full p-3 text-sm bg-white border border-gray-300 rounded-xl focus:border-blue-500 outline-none transition-all" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} required />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setEditingTrx(null)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">Batal</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h2>
          <p className="text-sm text-gray-500 mt-1">Ringkasan arus kas Pemasukan & Pengeluaran.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <Calendar size={16} className="text-gray-400 ml-2" />
          <select
            className="bg-transparent text-sm font-semibold text-gray-700 p-1.5 outline-none cursor-pointer"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="hari_ini">Hari Ini</option>
            <option value="bulan_ini">Bulan Ini</option>
            <option value="semua">Semua Waktu</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={64} className="text-green-600" /></div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Penjualan</p>
          <h3 className="text-2xl lg:text-3xl font-black text-gray-900">Rp {totalIncome.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingDown size={64} className="text-red-600" /></div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Pengeluaran</p>
          <h3 className="text-2xl lg:text-3xl font-black text-gray-900">Rp {totalExpense.toLocaleString('id-ID')}</h3>
        </div>
        <div className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden ${netProfit >= 0 ? 'bg-gray-900 border-gray-800' : 'bg-red-700 border-red-800'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white"><Wallet size={64} /></div>
          <p className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">Kas Laba Bersih</p>
          <h3 className="text-2xl lg:text-3xl font-black text-white">Rp {netProfit.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
            <Receipt size={16} className="text-gray-500" /> Buku Jurnal Mutasi
          </h3>
          {filterPeriod !== 'semua' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Terfilter</span>}
        </div>
        <div className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Waktu</th>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="px-5 py-3 text-right">Nominal</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {[...filteredFinances].reverse().map(trx => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500">{new Date(trx.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${trx.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                      {trx.paymentMethod && (
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{trx.paymentMethod}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{trx.category}</td>
                  <td className="px-5 py-3 text-gray-600 truncate max-w-[200px]" title={trx.note}>{trx.note || '-'}</td>
                  <td className={`px-5 py-3 text-right font-bold ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => handleOpenEdit(trx)} className="p-1.5 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors" title="Edit Transaksi">
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFinances.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-400 text-xs">Tidak ada transaksi pada periode ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VIEW: MANAJEMEN MENU
// ==========================================
const MenuView = ({ menus, setMenus, showToast }) => {
  const [formData, setFormData] = useState({ id: '', name: '', price: '', category: '', color: 'bg-red-700', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const colors = [
    { label: 'Merah Gelap', value: 'bg-red-700' },
    { label: 'Merah Terang', value: 'bg-red-500' },
    { label: 'Hijau', value: 'bg-green-700' },
    { label: 'Kuning / Amber', value: 'bg-amber-500' },
    { label: 'Oranye', value: 'bg-orange-500' },
    { label: 'Rose / Pink', value: 'bg-rose-500' },
    { label: 'Abu-abu', value: 'bg-gray-400' },
    { label: 'Biru', value: 'bg-blue-500' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) return;

    if (isEditing) {
      setMenus(prev => prev.map(m => m.id === formData.id ? { ...formData, price: parseFloat(formData.price) } : m));
      showToast('Menu berhasil diperbarui!', 'success');
    } else {
      const newMenu = {
        ...formData,
        id: `m${Date.now()}`,
        price: parseFloat(formData.price)
      };
      setMenus(prev => [...prev, newMenu]);
      showToast('Menu baru berhasil ditambahkan!', 'success');
    }
    handleCancel();
  };

  const handleEdit = (menu) => {
    setFormData(menu);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus menu ini? \n(Disarankan hanya menghapus menu yang tidak pernah terjual. Untuk menu lama lebih baik diedit/dinonaktifkan jika ada fiturnya nanti)')) {
      setMenus(prev => prev.filter(m => m.id !== id));
      showToast('Menu berhasil dihapus!', 'success');
    }
  };

  const handleCancel = () => {
    setFormData({ id: '', name: '', price: '', category: '', color: 'bg-red-700', image: '' });
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row gap-4 pb-20 md:pb-0 animate-in fade-in duration-300 items-start relative">

      {/* AREA KIRI: Daftar Menu (2/3 Split) */}
      <div className="w-full md:w-[65%] lg:w-[70%] space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-gray-500" /> Daftar Menu & Harga
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari menu atau kategori..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none w-full sm:w-56 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <PackageSearch size={14} className="absolute left-2.5 top-2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Nama Menu</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3 text-right">Harga (Rp)</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredMenus.map(menu => (
                  <tr key={menu.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded border border-gray-100 flex items-center justify-center text-white ${menu.image ? 'bg-gray-100' : menu.color} overflow-hidden shrink-0`}>
                          {menu.image ? (
                            <img src={menu.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold">{getInitials(menu.name)}</span>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{menu.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] border border-gray-200">{menu.category}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">Rp {menu.price.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(menu)} className="p-1.5 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors" title="Edit Menu">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(menu.id)} className="p-1.5 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors" title="Hapus Menu">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMenus.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-400 text-xs">Menu tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AREA KANAN: Form Manajemen (1/3 Split - Sticky) */}
      <div className="w-full md:w-[35%] lg:w-[30%] flex-shrink-0 md:sticky md:top-0">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Pencil className="text-red-700" size={16} /> {isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Menu</label>
              <input
                type="text"
                placeholder="Cth: Ayam Bakar Spesial"
                className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kategori</label>
              <input
                type="text"
                placeholder="Cth: Makanan, Minuman, Dimsum"
                className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                list="category-options"
                required
              />
              <datalist id="category-options">
                {[...new Set(menus.map(m => m.category))].map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Harga Jual (Rp)</label>
              <input
                type="number"
                placeholder="Cth: 15000"
                className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Upload Foto Menu</span>
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={18} className="text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-all cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Warna Ikon (Jika Tanpa Foto)</label>
              <select
                className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
              >
                {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 flex flex-col gap-2">
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-lg shadow-sm transform active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm">
              {isEditing ? <CheckCircle2 size={16} /> : <Plus size={16} />}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancel} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-100 transition-all text-sm">
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// VIEW: DASHBOARD
// ==========================================
const DashboardView = ({ finances, setActiveTab }) => {
  const [showQrisModal, setShowQrisModal] = useState(false);

  const todayFinances = finances.filter(f => new Date(f.date).toDateString() === new Date().toDateString());
  const totalIncome = todayFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = todayFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const todayTrx = todayFinances.filter(f => f.type === 'income').length;

  const recentTrx = [...finances].reverse().slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ringkasan Bisnis</h2>
          <p className="text-sm text-gray-500 mt-1">Pantau operasional Dapur Pedas hari ini.</p>
        </div>
      </div>

      <div className="bg-red-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#FFF" d="M45.7,-76.3C58.8,-69.3,68.7,-55.1,75.9,-40.5C83.1,-25.9,87.6,-10.9,85.2,3.2C82.8,17.3,73.5,30.5,63.1,41.9C52.7,53.3,41.2,62.9,27.8,70C14.4,77.1,-0.9,81.7,-16.1,80.1C-31.3,78.5,-46.3,70.6,-57.4,59.2C-68.5,47.8,-75.7,32.9,-79.8,17C-83.9,1.1,-84.9,-15.8,-79.3,-30.5C-73.7,-45.2,-61.5,-57.7,-47.4,-64.3C-33.3,-70.9,-17.3,-71.6,-0.6,-70.6C16.1,-69.6,32.6,-83.3,45.7,-76.3Z" transform="translate(100 100)" /></svg>
        </div>
        <div className="relative z-10">
          <p className="text-red-100 text-sm font-medium mb-4">Pendapatan Hari Ini</p>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Rp {totalIncome.toLocaleString('id-ID')}</h3>
          <div className="flex gap-6 border-t border-red-600/50 pt-4">
            <div>
              <p className="text-red-200 text-xs mb-1">Struk Keluar</p>
              <p className="font-semibold">{todayTrx} Transaksi</p>
            </div>
            <div>
              <p className="text-red-200 text-xs mb-1">Belanja Hari Ini</p>
              <p className="font-semibold">Rp {totalExpense.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-4 py-2">
        <button onClick={() => setActiveTab('pos')} className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 group-hover:border-red-500 group-hover:text-red-600 transition-all group-active:bg-gray-50"><ShoppingCart size={22} /></div>
          <span className="text-xs font-medium text-gray-700">Kasir</span>
        </button>
        <button onClick={() => setActiveTab('purchase')} className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 group-hover:border-red-500 group-hover:text-red-600 transition-all group-active:bg-gray-50"><ShoppingBag size={22} /></div>
          <span className="text-xs font-medium text-gray-700">Belanja</span>
        </button>
        <button onClick={() => setActiveTab('finance')} className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 group-hover:border-red-500 group-hover:text-red-600 transition-all group-active:bg-gray-50"><Wallet size={22} /></div>
          <span className="text-xs font-medium text-gray-700">Laporan</span>
        </button>
        <button onClick={() => setShowQrisModal(true)} className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 group-hover:border-red-500 group-hover:text-red-600 transition-all group-active:bg-gray-50"><QrCode size={22} /></div>
          <span className="text-xs font-medium text-gray-700">QRIS</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><History size={18} className="text-gray-500" /><h3 className="font-bold text-gray-800 text-sm">Aktivitas Terakhir</h3></div>
          <button onClick={() => setActiveTab('finance')} className="text-xs text-red-600 font-semibold hover:underline">Lihat Jurnal</button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTrx.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Belum ada transaksi</div>
          ) : (
            recentTrx.map(trx => (
              <div key={trx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{trx.category}</p>
                    <p className="text-xs text-gray-500">{new Date(trx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {trx.note || '-'}</p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${trx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                  {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal QRIS */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col relative">
            <button onClick={() => setShowQrisModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors z-10">
              <X size={20} />
            </button>
            <div className="p-6 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <QrCode size={28} />
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-1">QRIS Dapur Pedas</h3>
              <p className="text-sm text-gray-500 mb-6">Tunjukkan kode ini kepada pelanggan untuk menerima pembayaran digital.</p>

              <div className="w-full aspect-square bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-3 overflow-hidden mb-5 relative">
                <img
                  src="qris.png"
                  alt="QRIS Dapur Pedas"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=qris-placeholder";
                  }}
                />
              </div>

              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">A.N. DAPUR PEDAS MAMA ZIO</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN APP ROOT
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [menus, setMenus] = useState([]);
  const [finances, setFinances] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Jam real-time ──────────────────────────────
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ── Toast ──────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: '' });
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  }, []);

  // ── Fetch data dari Supabase ───────────────────
  const fetchMenus = useCallback(async () => {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) setMenus(data);
  }, []);

  const fetchFinances = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: true });
    if (!error) setFinances(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMenus(), fetchFinances()]);
      setLoading(false);
    };
    init();
  }, [fetchMenus, fetchFinances]);

  // ── Handler: Checkout POS → insert ke Supabase ─
  const handleCheckout = useCallback(async (totalAmount, cartDetails, paymentMethod) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: 'income',
        category: 'Penjualan POS',
        amount: totalAmount,
        note: cartDetails.map(c => `${c.name} (${c.qty})`).join(', '),
        payment_method: paymentMethod,
        date: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) { showToast('Gagal menyimpan transaksi!', 'error'); return; }
    setFinances(prev => [...prev, data]);
    showToast(`Pembayaran ${paymentMethod} sukses dicatat.`, 'success');
  }, [showToast]);

  // ── Handler: Catat Belanja → insert ke Supabase ─
  const handleRecordPurchase = useCallback(async (category, note, amount) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: 'expense',
        category,
        amount,
        note,
        date: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) { showToast('Gagal menyimpan pengeluaran!', 'error'); return; }
    setFinances(prev => [...prev, data]);
    showToast(`Pengeluaran ${category} berhasil dicatat.`, 'success');
  }, [showToast]);

  // ── Handler: Edit Transaksi → update ke Supabase ─
  const handleEditTransaction = useCallback(async (updatedTrx) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        type: updatedTrx.type,
        category: updatedTrx.category,
        note: updatedTrx.note,
        amount: updatedTrx.amount,
        payment_method: updatedTrx.paymentMethod
      })
      .eq('id', updatedTrx.id);
    if (error) { showToast('Gagal memperbarui transaksi!', 'error'); return; }
    setFinances(prev => prev.map(t => t.id === updatedTrx.id ? { ...t, ...updatedTrx } : t));
    showToast('Transaksi berhasil diperbarui.', 'success');
  }, [showToast]);

  // ── Handler: Manajemen Menu → CRUD ke Supabase ─
  const handleMenuChange = useCallback(async (action, payload) => {
    if (action === 'add') {
      const { data, error } = await supabase.from('menus').insert([payload]).select().single();
      if (error) { showToast('Gagal menambah menu!', 'error'); return null; }
      setMenus(prev => [...prev, data]);
      showToast('Menu baru berhasil ditambahkan!', 'success');
      return data;
    }
    if (action === 'edit') {
      const { error } = await supabase.from('menus').update(payload).eq('id', payload.id);
      if (error) { showToast('Gagal memperbarui menu!', 'error'); return; }
      setMenus(prev => prev.map(m => m.id === payload.id ? { ...m, ...payload } : m));
      showToast('Menu berhasil diperbarui!', 'success');
    }
    if (action === 'delete') {
      const { error } = await supabase.from('menus').delete().eq('id', payload);
      if (error) { showToast('Gagal menghapus menu!', 'error'); return; }
      setMenus(prev => prev.filter(m => m.id !== payload));
      showToast('Menu berhasil dihapus!', 'success');
    }
  }, [showToast]);

  // ── Tampilkan loading screen ───────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-black text-gray-900 text-lg">DAPUR PEDAS MAMA ZIO</p>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView finances={finances} setActiveTab={setActiveTab} />;
      case 'pos': return <POSView menus={menus} cart={cart} setCart={setCart} onCheckout={handleCheckout} />;
      case 'purchase': return <PurchaseView finances={finances} onRecordPurchase={handleRecordPurchase} />;
      case 'finance': return <FinanceView finances={finances} onEditTransaction={handleEditTransaction} />;
      case 'menu': return <MenuView menus={menus} onMenuChange={handleMenuChange} showToast={showToast} />;
      default: return <div>Memuat...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 selection:bg-red-200">
      <div className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-20">

        {/* BRAND & LOGO SIDEBAR */}
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5 w-full">
            {/* Logo: besar di desktop, tetap proporsional di mobile */}
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl flex items-center justify-center shadow border border-gray-100 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="Logo Mama Zio"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://api.dicebear.com/7.x/initials/svg?seed=DP&backgroundColor=b91c1c";
                }}
              />
            </div>
            {/* Nama brand: hanya tampil di sidebar lebar (lg) */}
            <div className="hidden lg:flex flex-col overflow-hidden">
              <h1 className="font-black text-[17px] tracking-tight leading-tight text-gray-900">DAPUR PEDAS</h1>
              <p className="text-[11px] text-red-600 font-extrabold tracking-[0.2em] uppercase">Mama Zio</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 lg:px-4 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 hidden lg:block">Menu Utama</p>
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'pos', icon: LayoutDashboard, label: 'Kasir (POS)' },
            { id: 'menu', icon: Utensils, label: 'Katalog Menu' },
            { id: 'purchase', icon: ShoppingBag, label: 'Catat Belanja' },
            { id: 'finance', icon: Wallet, label: 'Buku Jurnal' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-sm ${activeTab === item.id ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-red-600' : 'text-gray-400'} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full border border-gray-200 overflow-hidden shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=MamaZio" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">Mama'e Zio</p>
              <p className="text-xs text-gray-500 truncate">Owner</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
          <h2 className="text-xl font-bold text-gray-800 capitalize hidden sm:block">
            {activeTab === 'dashboard' ? 'Dashboard Utama' : activeTab === 'pos' ? 'Sistem Kasir' : activeTab === 'purchase' ? 'Pencatatan Belanja' : activeTab === 'menu' ? 'Manajemen Menu' : 'Buku Jurnal Keuangan'}
          </h2>

          {/* LOGO & NAMA BRAND — tampil di mobile (sidebar tersembunyi) */}
          <div className="flex items-center gap-3 sm:hidden">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow border border-gray-100 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://api.dicebear.com/7.x/initials/svg?seed=DP&backgroundColor=b91c1c";
                }}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-black tracking-tight text-gray-900 leading-none">DAPUR PEDAS</span>
              <span className="text-[10px] font-extrabold text-red-600 tracking-[0.18em] uppercase">Mama Zio</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tanggal & Jam */}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[11px] font-semibold text-gray-400 capitalize">{formattedDate}</span>
              <span className="text-base font-black text-gray-800 tabular-nums tracking-tight">{formattedTime}</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Bell size={20} /></button>
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              <Store size={20} />
              <span className="hidden md:block">Dapur Buka</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}