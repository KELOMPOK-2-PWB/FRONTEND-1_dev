"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Element/Navbar";

// --- KONFIGURASI API ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// --- INTERFACE ---
interface ApiProductDetails {
  _id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number; // Stok Master
}

interface ApiCartItem {
  _id: string;
  quantity: number; // Jumlah di keranjang
  product: ApiProductDetails | null;
}

// Tipe Data State Lokal
type CartItemState = {
  productId: string;
  name: string;
  price: number;
  quantity: number; // Jumlah Beli
  stock: number;    // 🔥 Stok Asli (Master)
  image: string;
  isChecked: boolean;
};

// --- MODAL COMPONENT ---
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
        
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          type === "success" ? "bg-green-900/30 text-green-500" : 
          type === "error" ? "bg-red-900/30 text-red-500" : 
          "bg-yellow-900/30 text-yellow-500"
        }`}>
          {type === "success" && <span className="text-2xl">✓</span>}
          {type === "error" && <span className="text-2xl">!</span>}
          {type === "confirm" && <span className="text-2xl">?</span>}
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
    "x-api-key": (BACKEND_TOKEN as string) || "",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

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

  // --- INITIAL LOAD ---
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login/users");
      return;
    }
    // Panggil fungsi fetch gabungan
    fetchDataCombined(token);
  }, []);

  // --- HITUNG TOTAL ---
  useEffect(() => {
    // Hitung total harga item yang dicentang
    const total = cartItems
      .filter((item) => item.isChecked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
    
    // Cek Select All status
    // Hanya perhitungkan item yang stoknya valid (>0) untuk select all logic
    const validItems = cartItems.filter(i => i.stock > 0); 
    const allChecked = validItems.length > 0 && validItems.every((item) => item.isChecked);
    setIsAllChecked(allChecked);
  }, [cartItems]);

  // --- 🔥 CORE LOGIC: GABUNGKAN DATA CART & PRODUCT (FIX DATA STOK 0) 🔥 ---
  const fetchDataCombined = async (token: string) => {
    setLoading(true);
    try {
      // 1. Request Cart
      const cartReq = fetchAPI("/api/cart", "GET", null, token);
      // 2. Request Master Products (Supaya dapat stok asli yang benar)
      const productsReq = fetchAPI("/api/products-users", "GET", null, token);

      const [cartRes, productsRes] = await Promise.all([cartReq, productsReq]);
      
      const cartData = await cartRes.json();
      const productsData = await productsRes.json();

      if (cartRes.ok && cartData) {
        const rawCartItems = cartData.items || (cartData.data && cartData.data.items) || [];
        // Pastikan productsData array
        const allProducts = Array.isArray(productsData) ? productsData : (productsData.data || []);

        const mergedItems: CartItemState[] = rawCartItems.map((cItem: ApiCartItem) => {
            if (!cItem.product) return null;

            // Cari produk asli di list products untuk dapat stok terbaru
            const masterProduct = allProducts.find((p: any) => p._id === cItem.product!._id);
            
            // 🔥 PRIORITASKAN STOK DARI MASTER PRODUCT 🔥
            // Jika tidak ketemu, fallback ke stok di cart (yang mungkin bug/0)
            const realStock = masterProduct ? masterProduct.quantity : (cItem.product.quantity || 0);
            
            let currentQty = cItem.quantity || 1;

            // Validasi: Jika quantity di cart entah kenapa lebih besar dari stok asli
            if (realStock > 0 && currentQty > realStock) {
                currentQty = realStock;
            }

            return {
                productId: cItem.product._id, 
                name: cItem.product.name,
                price: cItem.product.price,
                quantity: currentQty,
                stock: realStock, // Stok yang sudah dikoreksi
                image: cItem.product.images?.[0] || "",
                isChecked: false, 
            };
        }).filter((item: CartItemState | null) => item !== null); 

        setCartItems(mergedItems);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 🔥 FIX LOGIC UPDATE QUANTITY (MENGHILANGKAN POPUP SAAT KURANG) 🔥 ---
  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const targetItem = cartItems.find((item) => item.productId === productId);
    if (!targetItem) return;

    // 1. Validasi Batas Bawah: Tidak boleh kurang dari 1
    if (newQty < 1) return;

    // 2. 🔥 Validasi Batas Atas HANYA JIKA MENAMBAH 🔥
    // Jika user menekan tombol (-), newQty < quantity saat ini. Kita tidak perlu cek stok maksimal.
    // Ini mencegah popup muncul kalau stok di database sedang error (0).
    const isIncreasing = newQty > targetItem.quantity;
    
    if (isIncreasing) {
        if (targetItem.stock > 0 && newQty > targetItem.stock) {
            showModal("error", "Batas Stok", `Stok hanya tersisa ${targetItem.stock} pcs.`, closeModal);
            return;
        }
        // Jika stok benar-benar 0 dari DB, dan user coba nambah
        if (targetItem.stock === 0) {
             showModal("error", "Stok Habis", "Stok produk ini sedang kosong.", closeModal);
             return;
        }
    }

    // Update UI Optimistic
    setCartItems((prev) => prev.map((item) => 
      item.productId === productId ? { ...item, quantity: newQty } : item
    ));

    // Update Backend
    try {
      await fetchAPI("/api/cart/update", "PUT", { productId, quantity: newQty }, token);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Gagal update", error);
      // Jika gagal, refresh data untuk sinkronisasi ulang
      fetchDataCombined(token); 
    }
  };

  // --- INPUT MANUAL ---
  const handleInputChange = (productId: string, value: string) => {
      // Izinkan field kosong sementara saat mengetik
      if (value === "") {
          setCartItems(prev => prev.map(p => p.productId === productId ? { ...p, quantity: 0 } : p));
          return;
      }
      const num = parseInt(value);
      if (!isNaN(num)) {
          setCartItems(prev => prev.map(p => p.productId === productId ? { ...p, quantity: num } : p));
      }
  };

  const handleInputBlur = (productId: string, quantity: number, stock: number) => {
      let finalQty = quantity;
      
      // Jika user membiarkan kosong atau 0, kembalikan ke 1
      if (finalQty < 1) finalQty = 1;
      
      // Validasi Stok saat blur (hanya jika stok valid)
      if (stock > 0 && finalQty > stock) {
           showModal("error", "Stok Terbatas", `Maksimal pembelian ${stock} pcs`, closeModal);
           finalQty = stock;
      }
      
      handleUpdateQuantity(productId, finalQty);
  };

  // --- DELETE & CHECKOUT ---
  const confirmDelete = (productId: string) => {
    showModal("confirm", "Hapus Produk?", "Hapus dari keranjang?", () => { handleDelete(productId); closeModal(); });
  };

  const handleDelete = async (productId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setCartItems((prev) => prev.filter((item) => item.productId !== productId));

    try {
      await fetchAPI(`/api/cart/remove/${productId}`, "DELETE", null, token);
      window.dispatchEvent(new Event("cart-updated"));
      showModal("success", "Berhasil", "Produk dihapus.", closeModal);
    } catch (error) { 
      fetchDataCombined(token); 
    }
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter(item => item.isChecked);
    
    // Validasi akhir sebelum pindah halaman
    const invalidItems = selectedItems.filter(item => item.stock === 0 || item.quantity > item.stock);
    if (invalidItems.length > 0) {
        showModal("error", "Stok Masalah", `Produk "${invalidItems[0].name}" stoknya tidak mencukupi atau habis.`, closeModal);
        return;
    }

    if (selectedItems.length === 0) {
        showModal("error", "Pilih Produk", "Pilih produk dulu.", closeModal);
        return;
    }

    localStorage.setItem("checkoutData", JSON.stringify(selectedItems));
    router.push("/checkout");
  };

  // --- CHECKBOX ---
  const handleCheckItem = (productId: string) => {
    setCartItems((prev) => prev.map((item) => 
      item.productId === productId ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleCheckAll = () => {
    const newState = !isAllChecked;
    setIsAllChecked(newState);
    // Jangan centang item yang stoknya 0 (habis)
    setCartItems((prev) => prev.map((item) => ({ 
        ...item, 
        isChecked: item.stock > 0 ? newState : false 
    })));
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen bg-[#4F0F0F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />
      <CustomModal {...modal} onCancel={closeModal} />

      <main className="max-w-6xl mx-auto px-4 pt-[100px]">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <svg className="h-8 w-8 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Keranjang Belanja
        </h1>

        {loading ? (
           <div className="text-center py-20"><div className="w-10 h-10 border-4 border-[#FF3B30] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Memuat keranjang...</p></div>
        ) : cartItems.length === 0 ? (
           <div className="text-center py-20 bg-[#2a0505] rounded-xl border border-[#5c1010]"><p className="text-gray-400 text-lg mb-6">Keranjang kosong.</p><button onClick={() => router.push("/")} className="bg-[#FF3B30] text-white px-8 py-3 rounded-full font-bold">Belanja Sekarang</button></div>
        ) : (
          <div className="grid lg:grid-cols-[1fr,350px] gap-8">
            <div className="flex flex-col gap-4">
              <div className="bg-[#2a0505] border border-[#5c1010] p-4 rounded-lg flex items-center gap-4 sticky top-[80px] z-10 shadow-md">
                <input type="checkbox" checked={isAllChecked} onChange={handleCheckAll} className="w-5 h-5 accent-[#FF3B30] cursor-pointer" />
                <span className="font-bold text-sm">Pilih Semua ({cartItems.filter(i => i.stock > 0).length})</span>
              </div>

              {cartItems.map((item) => {
                const isDbEmpty = item.stock <= 0;
                // isMaxedOut: Stok ada, tapi jumlah di cart >= stok
                const isMaxedOut = item.quantity >= item.stock && !isDbEmpty;
                const remaining = Math.max(0, item.stock - item.quantity);

                return (
                <div key={item.productId} className={`bg-[#2a0505] border p-4 rounded-lg flex gap-4 items-center shadow-md transition-all ${item.isChecked ? "border-[#FF3B30] bg-[#3a0a0a]" : "border-[#5c1010]"} ${isDbEmpty ? "opacity-60" : ""}`}>
                  
                  {/* Checkbox: Disabled jika stok habis total */}
                  <input type="checkbox" checked={item.isChecked} onChange={() => !isDbEmpty && handleCheckItem(item.productId)} disabled={isDbEmpty} className={`w-5 h-5 accent-[#FF3B30] flex-shrink-0 ${isDbEmpty ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`} />
                  
                  <div className="w-24 h-24 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-700 relative">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>}
                    {/* Overlay hanya jika DB benar-benar 0 */}
                    {isDbEmpty && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] text-red-500 font-bold text-center border-2 border-red-900">STOK HABIS</div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
                    <p className="text-[#FF3B30] font-bold mb-1">{formatRupiah(item.price)}</p>
                    
                    <div className="mb-3">
                        {isDbEmpty ? (
                            <span className="text-xs font-bold text-red-500 bg-red-900/20 px-2 py-1 rounded">Stok Habis (Restock Soon)</span>
                        ) : (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${isMaxedOut ? "text-orange-400 bg-orange-900/20" : "text-green-400 bg-green-900/20"}`}>
                                {isMaxedOut ? "Stok Maksimal di Keranjang" : `Tersedia: ${remaining} pcs`}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                        {/* Container Tombol Quantity */}
                        <div className={`flex items-center border border-gray-600 rounded bg-[#1E1E1E] overflow-hidden ${isDbEmpty ? "opacity-50 pointer-events-none" : ""}`}>
                            
                            {/* TOMBOL MINUS */}
                            <button 
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} 
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#333] text-gray-300 active:bg-[#444] transition-colors"
                                disabled={item.quantity <= 1} 
                            >
                                -
                            </button>
                            
                            {/* INPUT MANUAL */}
                            <input 
                                type="number"
                                className="w-12 h-8 bg-transparent text-center text-sm font-mono focus:outline-none appearance-none border-l border-r border-gray-700"
                                value={item.quantity === 0 ? "" : item.quantity}
                                onChange={(e) => handleInputChange(item.productId, e.target.value)}
                                onBlur={() => handleInputBlur(item.productId, item.quantity, item.stock)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            />
                            
                            {/* TOMBOL PLUS */}
                            <button 
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} 
                                className={`w-8 h-8 flex items-center justify-center hover:bg-[#333] transition-colors ${isMaxedOut ? "text-gray-600 cursor-not-allowed bg-[#2a2a2a]" : "text-gray-300 active:bg-[#444]"}`}
                                disabled={isMaxedOut}
                            >
                                +
                            </button>
                        </div>
                        <button onClick={() => confirmDelete(item.productId)} className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-[#2a0505] hover:bg-[#3a0a0a] rounded-full border border-transparent hover:border-red-900/50"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            <div className="relative">
                <div className="bg-[#2a0505] border border-[#5c1010] p-6 rounded-lg shadow-xl sticky top-[100px]">
                    <h3 className="font-bold text-lg mb-4 border-b border-[#5c1010] pb-3 text-gray-200">Ringkasan Belanja</h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-400"><span>Total Barang</span><span>{cartItems.filter(i => i.isChecked).reduce((a, b) => a + b.quantity, 0)} Pcs</span></div>
                        <div className="flex justify-between text-sm text-gray-300"><span>Total Harga</span><span>{formatRupiah(totalPrice)}</span></div>
                    </div>
                    <div className="border-t border-[#5c1010] my-4"></div>
                    <div className="flex justify-between mb-6 font-bold text-xl items-center"><span>Total Tagihan</span><span className="text-[#FF3B30]">{formatRupiah(totalPrice)}</span></div>
                    <button disabled={totalPrice === 0} onClick={handleCheckout} className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 ${totalPrice > 0 ? "bg-[#FF3B30] hover:bg-[#d32f2f] hover:shadow-red-900/50" : "bg-gray-700 cursor-not-allowed opacity-50"}`}>Checkout ({cartItems.filter(i => i.isChecked).length})</button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}