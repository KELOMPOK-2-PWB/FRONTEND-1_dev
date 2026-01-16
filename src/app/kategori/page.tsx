"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Element/Navbar"; 

// --- KONFIGURASI API ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// --- TIPE DATA STRICT ---
interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  sold: number;
  rating?: number;
  images: string[];
}

// --- DUMMY CATEGORIES ---
const CATEGORIES = [
  { id: "all", name: "Semua Produk" },
  { id: "Pakaian", name: "Pakaian & Fashion" },
  { id: "Elektronik", name: "Elektronik & Gadget" },
  { id: "Makanan", name: "Makanan & Minuman" },
  { id: "Waifu", name: "Waifu (Eksklusif)" },
  { id: "Hobby", name: "Hobi & Koleksi" },
];

// --- KOMPONEN MODAL (Alert Card) ---
function CustomModal({
  isOpen,
  type,
  title,
  message,
  onConfirm,
}: {
  isOpen: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onConfirm}></div>
      <div className="bg-[#1E1E1E] text-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#333] p-6 relative z-10 flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          type === "success" ? "bg-green-900/30 text-green-500" : 
          type === "error" ? "bg-red-900/30 text-red-500" : "bg-blue-900/30 text-blue-500"
        }`}>
          {type === "success" ? "✓" : type === "error" ? "✕" : "!"}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <button onClick={onConfirm} className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-lg w-full ${
            type === "success" ? "bg-green-600 hover:bg-green-700" : 
            type === "error" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
        }`}>OK</button>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("terbaru"); 
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);

  // Modal State
  const [modal, setModal] = useState<{isOpen: boolean, type: "success"|"error"|"info", title: string, message: string}>({
    isOpen: false, type: "success", title: "", message: ""
  });

  const showModal = (type: "success"|"error"|"info", title: string, message: string) => {
    setModal({ isOpen: true, type, title, message });
  };

  // --- FETCH PRODUCTS ---
  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory !== "all") {
        queryParams.append("category", selectedCategory);
      }
      queryParams.append("sort", "terbaru"); 

      const url = `${BASE_URL}/api/products-users/search?${queryParams.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();

      if (res.ok) {
        let fetchedProducts: Product[] = Array.isArray(data) ? data : data.data || [];

        // Client Side Sorting
        if (sortBy === "harga-rendah") {
          fetchedProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === "harga-tinggi") {
          fetchedProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
          fetchedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "a-z") {
          fetchedProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "z-a") {
          fetchedProducts.sort((a, b) => b.name.localeCompare(a.name));
        }

        setProducts(fetchedProducts);
      } else {
        console.error("Gagal fetch:", data.message);
      }
    } catch (err) {
      console.error("Error connection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  // --- ADD TO CART ---
  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      showModal("error", "Gagal", "Harap login terlebih dahulu.");
      return;
    }

    setCartLoadingId(productId);

    try {
      const res = await fetch(`${BASE_URL}/api/cart/addCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showModal("success", "Berhasil", "Produk ditambahkan ke keranjang!");
      } else {
        showModal("error", "Gagal", data.message || "Gagal menambahkan produk.");
      }
    } catch (err) {
      console.error(err);
      showModal("error", "Error", "Terjadi kesalahan koneksi.");
    } finally {
      setCartLoadingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-[#7A1F1F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />
      <CustomModal {...modal} onConfirm={() => setModal({ ...modal, isOpen: false })} />

      {/* LAYOUT UTAMA 
          - max-w diperbesar jadi [1440px] biar lebih lebar di layar besar
          - px-4 md:px-8 untuk padding kiri kanan
          - Sidebar menggunakan width tetap (w-[260px]) agar tidak melar
      */}
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-[100px] flex flex-col md:flex-row gap-8">
        
        {/* --- SIDEBAR FILTER (FIXED WIDTH) --- */}
        <aside className="w-full md:w-[260px] shrink-0">
          <div className="bg-[#5c1010] border border-[#8B2626] rounded-xl p-5 sticky top-[100px] shadow-xl">
            <h2 className="text-lg font-bold mb-5 border-b border-[#8B2626] pb-3 flex items-center gap-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
            </h2>

            {/* KATEGORI */}
            <div className="mb-2">
              <h3 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider">Kategori</h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <label key={cat.id} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${selectedCategory === cat.id ? "bg-[#7A1F1F] border border-[#8B2626]" : "hover:bg-[#7A1F1F]/50"}`}>
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat.id}
                      checked={selectedCategory === cat.id}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="accent-white w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm ${selectedCategory === cat.id ? "text-white font-bold" : "text-gray-300"}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT (FLEX-1) --- */}
        <section className="flex-1">
          
          {/* HEADER: TITLE + JUMLAH + SORTIR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-[#5c1010] p-4 rounded-lg border border-[#8B2626] shadow-lg">
            
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              {selectedCategory === "all" ? "Semua Produk" : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm text-gray-300 whitespace-nowrap bg-black/20 px-3 py-1.5 rounded-md">
                    {products.length} Produk
                </span>

                <div className="relative group">
                    <div className="flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none pr-4"
                        >
                            <option value="terbaru">Paling Baru</option>
                            <option value="harga-rendah">Harga Terendah</option>
                            <option value="harga-tinggi">Harga Tertinggi</option>
                            <option value="rating">Rating Tertinggi</option>
                            <option value="a-z">Nama (A-Z)</option>
                            <option value="z-a">Nama (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>

          {/* GRID PRODUK */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-[#5c1010] rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#5c1010]/50 rounded-xl border border-dashed border-[#8B2626]">
              <p className="text-gray-300 text-lg">Tidak ada produk ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const imageUrl = p.images?.find(url => url && url.startsWith("http")) || "";
                
                return (
                  <div key={p._id} className="bg-black border border-[#333] rounded-xl overflow-hidden shadow-lg group hover:border-white transition-all duration-300 flex flex-col">
                    <div className="relative h-48 w-full bg-[#1a1a1a] overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                           <span className="text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-base mb-1 line-clamp-2 leading-tight" title={p.name}>{p.name}</h3>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wide mb-2">{p.category || "UMUM"}</p>
                        <p className="text-[#FF3B30] font-bold text-lg mb-4">{formatPrice(p.price)}</p>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => handleAddToCart(p._id)}
                          disabled={cartLoadingId === p._id}
                          className="p-2 border border-white rounded hover:bg-white hover:text-black transition-colors flex items-center justify-center w-10 shrink-0 group/btn"
                          title="Tambah ke Keranjang"
                        >
                          {cartLoadingId === p._id ? (
                             <div className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                          ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          )}
                        </button>
                        <button className="flex-1 bg-white text-black font-bold text-xs py-2 rounded hover:bg-gray-200 transition-colors active:scale-95">
                          Beli Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}