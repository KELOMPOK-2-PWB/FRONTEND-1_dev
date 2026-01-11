"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../component/Element/Navbar";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// --- TIPE DATA ---
type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  sold: number;
  isAdvertised: boolean;
  discount: number;
  images: string[];
  isDropItem: boolean;
};

// --- KOMPONEN MODAL CUSTOM (Card Alert) ---
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
      {/* Backdrop Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onConfirm}
      ></div>

      {/* Modal Card */}
      <div className="bg-[#1E1E1E] text-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#333] p-6 relative z-10 flex flex-col items-center text-center transform transition-all scale-100">
        
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          type === "success" ? "bg-green-900/30 text-green-500" : 
          type === "error" ? "bg-red-900/30 text-red-500" : 
          "bg-blue-900/30 text-blue-500"
        }`}>
          {type === "success" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {type === "error" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {type === "info" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-xl font-bold mb-2 tracking-wide">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>

        {/* Button */}
        <button
          onClick={onConfirm}
          className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-lg transition-transform transform active:scale-95 w-full ${
            type === "success" ? "bg-green-600 hover:bg-green-700" : 
            type === "error" ? "bg-red-600 hover:bg-red-700" : 
            "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
}

// DATA DUMMY BANNER
const BANNERS = [
  { id: 1, image: "/hero.jpg", title: "Discover New Collection", desc: "Dapatkan item eksklusif dengan harga terbaik.", color: "text-orange-400" },
  { id: 2, image: "/hero.jpg", title: "Flash Sale Serba Murah", desc: "Diskon hingga 90% untuk produk pilihan.", color: "text-yellow-400" },
  { id: 3, image: "/hero.jpg", title: "Gratis Ongkir Xtra", desc: "Belanja sepuasnya tanpa biaya pengiriman.", color: "text-green-400" }
];

export default function HomePage() {
  const router = useRouter(); 
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartLoading, setCartLoading] = useState<string | null>(null);

  // --- STATE MODAL ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Helper Show Modal
  const showModal = (type: "success" | "error" | "info", title: string, message: string) => {
    setModalConfig({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));

  // --- FUNGSI ADD TO CART ---
  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      showModal("error", "Akses Ditolak", "Harap login terlebih dahulu untuk belanja!");
      return;
    }

    setCartLoading(productId);

    try {
      const res = await fetch(`${BASE_URL}/api/cart/addCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-auth-token": token || "",
          "x-api-key": (BACKEND_TOKEN as string) || "",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1, 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showModal("success", "Berhasil", "Produk berhasil ditambahkan ke keranjang! 🛒");
      } else {
        showModal("error", "Gagal", data.message || "Gagal menambahkan ke keranjang.");
      }
    } catch (err) {
      console.error("Error add cart:", err);
      showModal("error", "Error Koneksi", "Gagal menghubungi server.");
    } finally {
      setCartLoading(null);
    }
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsLoggedIn(false);
        setError("Jika ingin membeli produk eksklusif harap login");
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const res = await fetch(`${BASE_URL}/api/products-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-auth-token": token || "",
            "x-api-key": (BACKEND_TOKEN as string) || "", 
          },
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("authToken");
            setIsLoggedIn(false);
            setError("Sesi kadaluarsa. Silakan login ulang.");
            setLoading(false);
            return;
          }
          throw new Error(data.message || "Gagal mengambil produk");
        }

        setProducts(Array.isArray(data) ? data : data.data || []);
        setLoading(false); 

      } catch (err: unknown) {
        console.error("ERROR FETCH:", err);
        let message = "Terjadi kesalahan saat mengambil produk.";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 5000); 
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
     return (
        <div className={`min-h-screen flex items-center justify-center transition-colors ${darkMode ? "bg-[#7A1F1F]" : "bg-gray-100"}`}>
            <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${darkMode ? "border-white" : "border-[#7A1F1F]"}`}></div>
                <p className={`font-inter text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>Memuat...</p>
            </div>
        </div>
     );
  }

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${
        darkMode ? "bg-[#7A1F1F] text-white" : "bg-gray-50 text-gray-900"
    }`}>
      
      <Navbar isLoggedIn={isLoggedIn} darkMode={darkMode} />

      {/* --- RENDER MODAL DISINI --- */}
      <CustomModal 
        {...modalConfig} 
        onConfirm={closeModal} 
      />

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg border transition-all hover:scale-110 ${
          darkMode ? "bg-white text-black border-gray-300" : "bg-[#1E1E1E] text-white border-gray-600"
        }`}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {isLoggedIn && (
        <section className="w-full relative mt-[70px]">
          <div className="relative w-full h-[260px] md:h-[320px] overflow-hidden bg-gray-900 group">
            <img
              src={BANNERS[currentSlide].image}
              alt="Banner"
              className="w-full h-full object-cover opacity-60 transition-all duration-500 ease-in-out"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute top-1/2 left-10 -translate-y-1/2 z-10 transition-all duration-500">
              <h1 className={`text-4xl md:text-5xl font-bold drop-shadow-lg ${BANNERS[currentSlide].color}`}>
                {BANNERS[currentSlide].title}
              </h1>
              <p className="text-gray-300 mt-2 text-sm md:text-base max-w-md animate-fadeIn">
                {BANNERS[currentSlide].desc}
              </p>
            </div>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white z-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white z-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {BANNERS.map((_, index) => (
                  <div key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${currentSlide === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`w-full flex justify-center px-4 relative z-20 pb-10 ${isLoggedIn ? "mt-10" : "mt-[120px]"}`}>
        <div className={`w-full max-w-5xl rounded-xl px-6 py-8 shadow-2xl transition-colors duration-300 ${darkMode ? "bg-[#5A1414] border border-[#8B2626]" : "bg-white border border-gray-200 shadow-gray-300"}`}>
          <h2 className={`text-center italic font-black text-3xl md:text-4xl mb-8 uppercase tracking-wider ${darkMode ? "text-white" : "text-[#7A1616]"}`} style={{ WebkitTextStroke: darkMode ? '1.5px black' : '0px', textShadow: darkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
            Produk Eksklusif
          </h2>

          {error ? (
            <div className={`w-full border rounded-lg flex flex-col items-center justify-center py-12 px-4 gap-5 animate-fadeIn ${darkMode ? "bg-[#3f0e0e]/80 border-red-500/30" : "bg-red-50 border-red-200"}`}>
                <div className={`p-3 rounded-full ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-8v4m0-8a8 8 0 100 16 8 8 0 000-16z" /></svg>
                </div>
                <p className={`text-base font-medium tracking-wide text-center ${darkMode ? "text-white" : "text-gray-800"}`}>{error}</p>
                <button onClick={() => router.push('/login/users')} className="bg-[#e53935] text-white px-8 py-2.5 rounded-md font-bold text-sm hover:bg-[#b71c1c] transition-all shadow-lg hover:scale-105 active:scale-95">Login Sekarang</button>
            </div>
          ) : (
            <>
                {products.length === 0 && (
                    <p className={`text-center text-sm opacity-80 py-10 ${darkMode ? "text-white" : "text-gray-600"}`}>Belum ada produk yang dapat ditampilkan.</p>
                )}
                {products.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {products.map((p) => {
                        const imageUrl = p.images?.find((url) => url && url.startsWith("http")) || "";
                        return (
                        <div key={p._id} className={`flex flex-col border rounded-lg overflow-hidden shadow-md transition-all duration-300 group cursor-pointer ${darkMode ? "bg-[#1E1E1E] border-[#333] hover:shadow-red-900/20 hover:border-red-800" : "bg-white border-gray-200 hover:shadow-xl hover:border-red-300"}`}>
                            <div className="relative h-40 w-full bg-gray-800 overflow-hidden">
                                {imageUrl ? (
                                <img src={imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                ) : null}
                                {!imageUrl && <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">No Image</div>}
                                {p.discount > 0 && <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">-{p.discount}%</div>}
                            </div>
                            <div className="flex-1 flex flex-col justify-between p-3">
                                <div>
                                    <p className={`font-semibold text-sm truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`} title={p.name}>{p.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{p.category}</p>
                                    <div className="mt-2"><span className="font-bold text-[#e53935] text-sm">{formatPrice(p.price)}</span></div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleAddToCart(p._id); }} disabled={cartLoading === p._id} className={`p-2 rounded border transition-colors flex items-center justify-center ${darkMode ? "border-gray-500 hover:bg-gray-700 text-white" : "border-gray-300 hover:bg-gray-100 text-black"}`} title="Tambah ke Keranjang">
                                        {cartLoading === p._id ? (
                                            <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        )}
                                    </button>
                                    <button className={`flex-1 text-xs font-bold px-2 py-2 rounded transition-colors ${darkMode ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-800 text-white"}`}>Beli Sekarang</button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}