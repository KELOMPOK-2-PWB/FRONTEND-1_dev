"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  isLoggedIn?: boolean;
  darkMode?: boolean;
}

// --- TYPE DEFINITIONS BARU UNTUK CART ITEM ---
interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

// Konfigurasi API
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// Helper Format Rupiah
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

export default function Navbar({ isLoggedIn = false, darkMode = true }: NavbarProps) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<"cart" | "notif" | "profile" | null>(null);
  
  // State Data
  const [userInitial, setUserInitial] = useState("A");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // 🔥 State Cart Diperbarui
  const [cartCount, setCartCount] = useState(0); 
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Menyimpan detail barang
  
  const [notifCount, setNotifCount] = useState(3); 

  // State Search
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Ambil Data User
  useEffect(() => {
    if (typeof window !== "undefined" && isLoggedIn) {
      try {
        const userDataStr = localStorage.getItem("userData");
        let backendAvatar = null;
        
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          const identifier = user.email || user.username || "A";
          setUserInitial(identifier.charAt(0).toUpperCase());
          backendAvatar = user.avatar;
        }

        const localAvatar = localStorage.getItem("my_custom_avatar");

        if (localAvatar) {
            setAvatarUrl(localAvatar);
        } else if (backendAvatar) {
            setAvatarUrl(backendAvatar);
        } else {
            setAvatarUrl(null);
        }

      } catch (e) {
        console.error("Gagal load user data", e);
      }
    }
  }, [isLoggedIn]);

  // 2. Fetch Cart Data (Count + Items)
  const fetchCartData = useCallback(async () => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-api-key": BACKEND_TOKEN || "",
        },
      });

      const data = await res.json();

      if (res.ok && data) {
        // Ambil array items
        const items: CartItem[] = data.items || [];
        
        // Simpan detail items ke state
        setCartItems(items);

        // Hitung total quantity
        const totalQty = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setCartCount(totalQty);
      }
    } catch (err) {
      console.error("Gagal mengambil data keranjang:", err);
    }
  }, [isLoggedIn]);

  // 3. Efek Listen Event
  useEffect(() => {
    fetchCartData();

    const handleCartUpdate = () => {
      fetchCartData();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [fetchCartData]);

  // 4. Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("my_custom_avatar");
    window.location.href = "/login/users"; 
  };

  return (
    <>
      {/* Overlay Gelap */}
      {(activeMenu === "cart" || activeMenu === "notif") && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" />
      )}

      <nav 
        className={`w-full h-[70px] flex items-center justify-between px-6 fixed top-0 z-50 border-b shadow-md transition-colors duration-300 ${
          darkMode 
            ? "bg-[#7A1616] text-white border-[#9a3a3a]" 
            : "bg-white text-gray-800 border-gray-200"
        }`}
      >
        
        {/* BAGIAN KIRI: LOGO + KATEGORI */}
        <div className="flex items-center gap-8">
            <div 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            >
              <img 
                src="/A-logo.png" 
                alt="Logo" 
                className="w-20 h-20 object-contain drop-shadow-md" 
              />
              <span className={`font-black text-xl tracking-wide ${darkMode ? "text-white" : "text-[#7A1616]"}`}>
                SHOP
              </span>
            </div>

            <span 
                onClick={() => router.push('/kategori')}
                className={`text-base font-bold tracking-wide cursor-pointer transition-colors duration-200 ${
                  darkMode 
                    ? "text-gray-200 hover:text-[#3f0e0e] hover:shadow-red-500" 
                    : "text-gray-600 hover:text-[#7A1616]"
                }`}
            >
                Kategori
            </span>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Cari di Ashura" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-md py-2 px-4 text-sm focus:outline-none focus:border-[#e53935] transition-colors ${
                darkMode 
                  ? "bg-[#5c1010] border-[#9a3a3a] text-white placeholder-gray-400" 
                  : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"
              }`}
            />
            <button 
              type="submit"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-80 ${darkMode ? "bg-[#7A1616]" : "bg-gray-200"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* MENU KANAN */}
        <div className="flex items-center gap-6">
          
          {isLoggedIn ? (
            <>
              {/* 1. Keranjang */}
              <div 
                className="relative group py-4"
                onMouseEnter={() => setActiveMenu("cart")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <div 
                  className="cursor-pointer relative transform transition-transform hover:scale-110"
                  onClick={() => router.push('/keranjang')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-[#e53935]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#e53935] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#7A1616] shadow-sm animate-bounce-short">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>

                {/* 🔥🔥 UPDATED DROPDOWN CART LIST 🔥🔥 */}
                {activeMenu === "cart" && (
                  <div className={`absolute top-[55px] right-[-80px] md:right-0 w-[360px] min-h-[150px] border shadow-2xl rounded-b-md z-50 flex flex-col animate-fadeIn ${darkMode ? "bg-[#5c1010] border-[#9a3a3a]" : "bg-white border-gray-200"}`}>
                    
                    {/* Header Dropdown */}
                    <div className={`p-3 border-b flex justify-between items-center ${darkMode ? "bg-[#4a0b0b] border-[#7a1f1f]" : "bg-gray-50 border-gray-200"}`}>
                      <span className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>Keranjang ({cartCount})</span>
                      <span 
                        className="text-xs text-[#e53935] cursor-pointer hover:underline"
                        onClick={() => router.push('/keranjang')}
                      >
                        Lihat Semua
                      </span>
                    </div>

                    {/* List Item Area */}
                    <div className={`flex-1 flex flex-col ${cartCount === 0 ? "items-center justify-center p-6" : ""}`}>
                        {cartCount > 0 ? (
                          <>
                            {/* Scrollable List */}
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div 
                                        key={item._id} 
                                        className={`flex items-center gap-3 p-3 border-b transition-colors ${darkMode ? "border-[#7a1f1f] hover:bg-[#4a0b0b]" : "border-gray-100 hover:bg-gray-50"}`}
                                    >
                                        {/* Gambar Produk */}
                                        <div className="w-12 h-12 flex-shrink-0 bg-black rounded border border-gray-600 overflow-hidden">
                                            {item.product?.images?.[0] && (
                                                <img 
                                                    src={item.product.images[0]} 
                                                    alt={item.product.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        {/* Info Produk */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                {item.product?.name || "Produk"}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {item.quantity} x
                                                </span>
                                                <span className="text-xs font-bold text-[#e53935]">
                                                    {formatRupiah(item.product?.price || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Button */}
                            <div className={`p-3 ${darkMode ? "bg-[#4a0b0b]" : "bg-gray-50"}`}>
                                <button 
                                    onClick={() => router.push('/keranjang')} 
                                    className="bg-[#e53935] text-white px-4 py-2 rounded font-bold text-xs hover:bg-red-700 w-full transition-colors shadow-md"
                                >
                                    Tampilkan Keranjang
                                </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Empty State */}
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mb-2 ${darkMode ? "text-gray-600" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Wah, keranjangmu kosong</p>
                          </>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Notifikasi */}
              <div 
                className="relative group py-4"
                onMouseEnter={() => setActiveMenu("notif")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <div className="cursor-pointer relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-[#e53935]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#e53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                      {notifCount}
                    </span>
                  )}
                </div>

                {activeMenu === "notif" && (
                  <div className={`absolute top-[55px] right-[-50px] w-[300px] min-h-[200px] border shadow-2xl rounded-b-md z-50 flex flex-col animate-fadeIn ${darkMode ? "bg-[#5c1010] border-[#9a3a3a]" : "bg-white border-gray-200"}`}>
                    <div className={`p-3 border-b flex justify-between items-center ${darkMode ? "bg-[#4a0b0b] border-[#7a1f1f]" : "bg-gray-50 border-gray-200"}`}>
                      <span className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>Notifikasi ({notifCount})</span>
                      <span className="text-xs text-[#e53935] cursor-pointer hover:underline">Tandai dibaca</span>
                    </div>
                    <div className={`flex-1 flex items-center justify-center text-sm p-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Belum ada notifikasi baru
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Pesan */}
              <div 
                className="cursor-pointer hover:scale-110 transition-transform relative"
                onClick={() => router.push('/pesan')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-[#e53935]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              {/* 4. Profile */}
              <div 
                className="relative group py-4 pl-2"
                onMouseEnter={() => setActiveMenu("profile")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold cursor-pointer border transition-all overflow-hidden ${darkMode ? "bg-purple-600 text-white border-white/30 hover:border-white" : "bg-purple-600 text-white border-purple-800 hover:bg-purple-700"}`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>

                {/* Dropdown Menu */}
                {activeMenu === "profile" && (
                  <div className={`absolute top-[55px] right-0 w-[180px] border shadow-xl rounded-b-md z-50 py-2 animate-fadeIn flex flex-col ${darkMode ? "bg-[#5c1010] border-[#9a3a3a]" : "bg-white border-gray-200"}`}>
                    <button 
                      onClick={() => router.push('/profile')}
                      className={`flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors ${darkMode ? "text-gray-200 hover:bg-[#7a1f1f] hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}
                    >
                        Akun Saya
                    </button>
                    <button 
                      onClick={() => router.push('/pesanan')}
                      className={`flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors ${darkMode ? "text-gray-200 hover:bg-[#7a1f1f] hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}
                    >
                        Pesanan Saya
                    </button>
                    <div className={`h-px my-1 mx-2 ${darkMode ? "bg-[#7a1f1f]" : "bg-gray-200"}`}></div>
                    <button 
                      onClick={handleLogout}
                      className={`flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors ${darkMode ? "text-red-300 hover:bg-[#7a1f1f] hover:text-red-100" : "text-red-600 hover:bg-red-50"}`}
                    >
                        Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button 
              onClick={() => router.push('/login/users')}
              className="bg-[#e53935] hover:bg-[#b71c1c] text-white px-6 py-2 rounded-md font-bold text-sm transition-all shadow-lg border border-[#ff5f5f] hover:shadow-red-500/30"
            >
              Masuk
            </button>
          )}
        </div>
      </nav>
    </>
  );
}