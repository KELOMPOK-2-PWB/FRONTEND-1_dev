"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Element/Navbar";

// --- KONFIGURASI API ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// --- 1. INTERFACE SESUAI API (SS 1) ---
// Struktur: items -> product -> details
interface ApiProductDetails {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface ApiCartItem {
  _id: string; // ID unik item di keranjang
  quantity: number;
  product: ApiProductDetails; // Object product bersarang di sini
}

interface ApiCartResponse {
  _id: string;
  user: string;
  items: ApiCartItem[];
}

// Tipe Data untuk State Lokal (Frontend)
type CartItemState = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isChecked: boolean;
};

// --- KOMPONEN MODAL CUSTOM ---
function CustomModal({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  type: "success" | "error" | "confirm";
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={type !== 'confirm' ? onConfirm : undefined}></div>
      <div className="bg-[#1E1E1E] text-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#333] p-6 relative z-10 text-center">
        
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          type === "success" ? "bg-green-900/30 text-green-500" : 
          type === "error" ? "bg-red-900/30 text-red-500" : 
          "bg-yellow-900/30 text-yellow-500"
        }`}>
          {type === "success" && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          {type === "error" && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          {type === "confirm" && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          {type === "confirm" && (
            <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#333]">Batal</button>
          )}
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-bold text-white shadow-lg ${
              type === "success" ? "bg-green-600 hover:bg-green-700" : 
              type === "error" ? "bg-red-600 hover:bg-red-700" : 
              "bg-[#FF3B30] hover:bg-[#d32f2f]"
            }`}
          >
            {type === "confirm" ? "Ya, Hapus" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- HELPER FETCH ---
async function fetchAPI(endpoint: string, method: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": BACKEND_TOKEN || "",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// --- KOMPONEN UTAMA ---
export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemState[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAllChecked, setIsAllChecked] = useState(false);

  // State Modal
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "confirm";
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, type: "success", title: "", message: "", onConfirm: () => {} });

  const showModal = (type: "success" | "error" | "confirm", title: string, message: string, onConfirm: () => void) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Cek Login & Fetch Data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login/users");
      return;
    }
    fetchCart(token);
  }, []);

  // Hitung Total
  useEffect(() => {
    const total = cartItems
      .filter((item) => item.isChecked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
    setIsAllChecked(cartItems.length > 0 && cartItems.every((item) => item.isChecked));
  }, [cartItems]);

  // 1. GET Cart (Updated Logic Sesuai JSON)
  const fetchCart = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetchAPI("/api/cart", "GET", null, token);
      const data = await res.json();
      
      if (res.ok && data) {
        // Handle struktur response yg mungkin dibungkus 'data' atau langsung object
        const cartData: ApiCartResponse = data.data || data; 
        const itemsList = cartData.items || [];

        // Mapping Data dari Nested Object ke Flat State
        const items: CartItemState[] = itemsList.map((item) => ({
          productId: item.product._id, // Ambil ID dari object product
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || "", // Ambil gambar pertama
          isChecked: false,
        }));

        setCartItems(items);
      } else {
        console.error("Gagal ambil keranjang");
      }
    } catch (error) {
      console.error("Error fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE Quantity
  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Optimistic Update
    setCartItems((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity: newQty } : item));

    try {
      await fetchAPI("/api/cart/update", "PUT", { productId, quantity: newQty }, token);
    } catch {
      fetchCart(token); // Revert jika gagal
    }
  };

  // 3. DELETE Item (Pakai Modal Confirm)
  const confirmDelete = (productId: string) => {
    showModal("confirm", "Hapus Produk?", "Apakah Anda yakin ingin menghapus produk ini dari keranjang?", () => {
      handleDelete(productId);
      closeModal();
    });
  };

  const handleDelete = async (productId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setCartItems((prev) => prev.filter((item) => item.productId !== productId));

    try {
      await fetchAPI(`/api/cart/remove/${productId}`, "DELETE", null, token);
      showModal("success", "Berhasil", "Produk telah dihapus.", closeModal);
    } catch {
      fetchCart(token);
    }
  };

  // Checkbox Logic
  const handleCheckItem = (productId: string) => {
    setCartItems((prev) => prev.map((item) => item.productId === productId ? { ...item, isChecked: !item.isChecked } : item));
  };

  const handleCheckAll = () => {
    const newState = !isAllChecked;
    setIsAllChecked(newState);
    setCartItems((prev) => prev.map((item) => ({ ...item, isChecked: newState })));
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen bg-[#4F0F0F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />
      <CustomModal {...modal} onCancel={closeModal} />

      {/* PERBAIKAN BLACK BAR: 
          Gunakan pt-[100px] (padding-top) bukan mt-[...] 
          agar background color tetap menyambung ke atas.
      */}
      <main className="max-w-6xl mx-auto px-4 pt-[100px]">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <svg className="h-8 w-8 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Keranjang Belanja
        </h1>

        {loading ? (
           <div className="text-center py-20">
             <div className="w-10 h-10 border-4 border-[#FF3B30] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p>Memuat keranjang...</p>
           </div>
        ) : cartItems.length === 0 ? (
           <div className="text-center py-20 bg-[#2a0505] rounded-xl border border-[#5c1010]">
             <p className="text-gray-400 text-lg mb-4">Keranjang kamu masih kosong nih.</p>
             <button onClick={() => router.push("/")} className="bg-[#FF3B30] hover:bg-[#d32f2f] text-white px-6 py-2 rounded font-bold">Mulai Belanja</button>
           </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr,350px] gap-8">
            {/* ITEM LIST */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#2a0505] border border-[#5c1010] p-4 rounded-lg flex items-center gap-4">
                <input type="checkbox" checked={isAllChecked} onChange={handleCheckAll} className="w-5 h-5 accent-[#FF3B30] cursor-pointer" />
                <span className="font-bold text-sm">Pilih Semua ({cartItems.length})</span>
              </div>

              {cartItems.map((item) => (
                <div key={item.productId} className="bg-[#2a0505] border border-[#5c1010] p-4 rounded-lg flex gap-4 items-center shadow-md hover:border-[#FF3B30] transition-colors">
                  <input type="checkbox" checked={item.isChecked} onChange={() => handleCheckItem(item.productId)} className="w-5 h-5 accent-[#FF3B30] cursor-pointer flex-shrink-0" />
                  
                  <div className="w-24 h-24 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-700">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-[#FF3B30] font-bold mb-2">{formatRupiah(item.price)}</p>
                    
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-gray-600 rounded">
                            <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1 hover:bg-[#3f0e0e]" disabled={item.quantity <= 1}>-</button>
                            <span className="px-3 py-1 border-l border-r border-gray-600 min-w-[40px] text-center bg-[#1a0505] text-sm">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1 hover:bg-[#3f0e0e]">+</button>
                        </div>
                        <button onClick={() => confirmDelete(item.productId)} className="text-gray-500 hover:text-red-500 transition">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RINGKASAN BELANJA */}
            <div className="relative">
                <div className="bg-[#2a0505] border border-[#5c1010] p-6 rounded-lg shadow-lg sticky top-[100px]">
                    <h3 className="font-bold text-lg mb-4 border-b border-[#5c1010] pb-3">Ringkasan Belanja</h3>
                    <div className="flex justify-between mb-2 text-sm text-gray-300">
                        <span>Total Harga ({cartItems.filter(i => i.isChecked).length} barang)</span>
                        <span>{formatRupiah(totalPrice)}</span>
                    </div>
                    <div className="border-t border-[#5c1010] my-4"></div>
                    <div className="flex justify-between mb-6 font-bold text-xl">
                        <span>Total Tagihan</span>
                        <span className="text-[#FF3B30]">{formatRupiah(totalPrice)}</span>
                    </div>
                    <button 
                        disabled={totalPrice === 0}
                        onClick={() => showModal("success", "Checkout", "Fitur checkout akan segera hadir!", closeModal)}
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition ${totalPrice > 0 ? "bg-[#FF3B30] hover:bg-[#d32f2f]" : "bg-gray-700 cursor-not-allowed opacity-50"}`}
                    >
                        Beli ({cartItems.filter(i => i.isChecked).length})
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}