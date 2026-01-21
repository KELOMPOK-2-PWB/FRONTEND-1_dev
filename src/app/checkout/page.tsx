"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Element/Navbar";
import axios from "axios";

// --- KONFIGURASI API ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// --- AXIOS INSTANCE ---
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": BACKEND_TOKEN || "",
  },
});

// Helper set token
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ============================================================================
// 1. TIPE DATA
// ============================================================================

interface Address {
  _id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefaultAddress: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItem {
  _id: string;
  quantity: number;
  product: Product;
}

interface CheckoutPayload {
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  shippingCost: number;
  selectedProductIds: string[];
  paymentMethod: string;
}

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

// ============================================================================
// 3. KOMPONEN PAGE
// ============================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // 🔥 Default Payment langsung QRIS
  const [paymentMethod, setPaymentMethod] = useState("QRIS");

  const SHIPPING_COST = 10000;

  // Load Data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login/users");
      return;
    }
    setAuthToken(token);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // 1. Ambil Alamat (TETAP DARI API)
      const addrRes = await api.get("/api/users/address");
      const addrData = addrRes.data;
      
      let listAddress: Address[] = [];
      if (Array.isArray(addrData)) {
        listAddress = addrData;
      } else if (addrData && Array.isArray((addrData as any).data)) {
        listAddress = (addrData as any).data;
      }
      setAddresses(listAddress);

      // Auto select default address
      const defaultAddr = listAddress.find((a) => a.isDefaultAddress);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      else if (listAddress.length > 0) setSelectedAddressId(listAddress[0]._id);

      // 2. Ambil Barang DARI LOCALSTORAGE (BUKAN API LAGI)
      // Supaya hanya barang yang dicentang yang muncul
      const checkoutData = localStorage.getItem("checkoutData");
      
      if (checkoutData) {
        const parsedData = JSON.parse(checkoutData);
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Kita ubah format data LocalStorage agar cocok dengan format UI (CartItem)
          const mappedItems: CartItem[] = parsedData.map((item: any) => ({
            _id: item.productId, // Gunakan productId sebagai ID unik
            quantity: item.quantity,
            product: {
                _id: item.productId,
                name: item.name,
                price: item.price,
                images: [item.image] // Masukkan image string ke dalam array
            }
          }));
          
          setCartItems(mappedItems);
        } else {
            // Jika data kosong/rusak, kembalikan ke cart
            router.push("/cart");
        }
      } else {
         // Jika tidak ada data checkout, kembalikan ke cart
         router.push("/cart");
      }

    } catch (error) {
      console.error("Error loading checkout data", error);
    } finally {
      setLoading(false);
    }
  };

  // Kalkulasi
  const subTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const grandTotal = subTotal + SHIPPING_COST;
  const selectedAddress = addresses.find(a => a._id === selectedAddressId);

  // --- 🔥 HANDLE CHECKOUT ---
  const handlePay = async () => {
    if (!selectedAddress) {
      alert("Harap pilih alamat pengiriman!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    setProcessing(true);

    const payload: CheckoutPayload = {
      shippingAddress: {
        street: selectedAddress.street,
        city: selectedAddress.city,
        province: selectedAddress.province,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country || "Indonesia"
      },
      shippingCost: SHIPPING_COST,
      // Ambil ID produk dari state cartItems yang sudah difilter
      selectedProductIds: cartItems.map(item => item.product._id),
      paymentMethod: "QRIS"
    };

    try {
      const response = await api.post("/api/orders/checkout", payload);

      if (response.status >= 200 && response.status < 300) {
        // Ambil orderId
        const orderId = 
            response.data.orderId || 
            response.data.data?.orderId || 
            response.data.result?.orderId ||
            (response.data.data && response.data.data._id); 
        
        if (orderId) {
            // SIMPAN ID KE LOCAL STORAGE
            localStorage.setItem("current_order_id", orderId);
            
            // HAPUS DATA CHECKOUT SEMENTARA AGAR BERSIH
            localStorage.removeItem("checkoutData");

            // REDIRECT KE HALAMAN PAYMENT
            router.push("/payment");
        } else {
            alert("Gagal mendapatkan Order ID.");
        }
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      const msg = error.response?.data?.message || "Gagal melakukan checkout.";
      alert("Gagal: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#7A1F1F] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#7A1F1F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />

      <main className="max-w-7xl mx-auto px-4 pt-[100px]">
        <h1 className="text-3xl font-bold mb-8 pl-2 border-l-4 border-white">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- KOLOM KIRI (Span 2) --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARD 1: ALAMAT */}
            <div className="bg-[#2a0505] border border-[#5c1010] rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4 border-b border-[#5c1010] pb-2">
                <h2 className="text-xl font-bold">Alamat Pengiriman</h2>
                <button onClick={() => router.push("/profile?tab=alamat")} className="text-xs text-[#ffaaaa] hover:text-white underline">
                  Ubah Alamat
                </button>
              </div>

              {addresses.length > 0 ? (
                <div>
                  <select 
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full bg-[#3f0e0e] border border-[#5c1010] text-white p-3 rounded mb-4 focus:outline-none focus:border-red-500"
                  >
                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.street} ({addr.city})
                      </option>
                    ))}
                  </select>

                  {selectedAddress && (
                    <div className="text-sm text-gray-300 bg-[#1a0202] p-4 rounded border border-[#3f0e0e]">
                      <p className="font-bold text-white mb-1">{selectedAddress.street}</p>
                      <p>{selectedAddress.city}, {selectedAddress.province}</p>
                      <p>{selectedAddress.postalCode}</p>
                      <p className="mt-1 text-xs text-red-400 font-bold">{selectedAddress.country || "Indonesia"}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-2">Belum ada alamat.</p>
                  <button onClick={() => router.push("/profile?tab=alamat")} className="bg-white text-black px-4 py-2 rounded font-bold text-sm">
                    + Tambah Alamat
                  </button>
                </div>
              )}
            </div>

            {/* CARD 2: BARANG */}
            <div className="bg-[#2a0505] border border-[#5c1010] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 border-b border-[#5c1010] pb-2">Barang</h2>
              
              {cartItems.length === 0 ? (
                 <p className="text-center py-8 text-gray-400 italic">Keranjang kosong. Silakan belanja dulu.</p>
              ) : (
                <div className="space-y-4">
                    {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 bg-[#3f0e0e]/50 p-3 rounded-lg border border-[#5c1010]">
                        <div className="w-20 h-20 bg-black rounded overflow-hidden shrink-0 border border-[#5c1010]">
                        {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-500">No IMG</div>
                        )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-white line-clamp-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {item.quantity} x {formatRupiah(item.product.price)}
                        </p>
                        </div>
                        <div className="flex items-center">
                        <span className="font-bold text-[#ffaaaa]">{formatRupiah(item.product.price * item.quantity)}</span>
                        </div>
                    </div>
                    ))}
                </div>
              )}
            </div>

          </div>

          {/* --- KOLOM KANAN (Span 1) --- */}
          <div className="space-y-6">
            
            {/* CARD 3: METODE PEMBAYARAN (HANYA QRIS) */}
            <div className="bg-[#2a0505] border border-[#5c1010] rounded-xl p-6 shadow-lg h-fit">
              <h2 className="text-xl font-bold mb-4 border-b border-[#5c1010] pb-2">Metode Pembayaran</h2>
              <div className="flex flex-col gap-2">
                
                {/* Opsi QRIS (Terkunci / Selalu Aktif) */}
                <label className="flex items-center p-3 rounded cursor-pointer border transition-all bg-[#3f0e0e] border-white">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="QRIS" 
                      checked={true}
                      readOnly
                      className="accent-white w-4 h-4 mr-3"
                    />
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">QRIS</span>
                        <span className="text-[10px] bg-white text-black px-1.5 rounded font-bold">INSTANT</span>
                    </div>
                </label>

              </div>
            </div>

            {/* CARD 4: RINGKASAN & TOMBOL BAYAR */}
            <div className="bg-[#2a0505] border border-[#5c1010] rounded-xl p-6 shadow-xl sticky top-[100px]">
              <h2 className="text-lg font-bold mb-4 border-b border-[#5c1010] pb-2">Ringkasan Belanja</h2>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Total Harga ({cartItems.length} barang)</span>
                  <span>{formatRupiah(subTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Biaya Pengiriman</span>
                  <span>{formatRupiah(SHIPPING_COST)}</span>
                </div>
              </div>

              <div className="border-t border-[#5c1010] py-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total Tagihan</span>
                <span className="text-xl font-bold text-[#ffaaaa]">{formatRupiah(grandTotal)}</span>
              </div>

              <button 
                onClick={handlePay}
                disabled={processing || cartItems.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-black shadow-lg transition-transform active:scale-95 ${
                  processing || cartItems.length === 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                {processing ? "Memproses..." : "Bayar via QRIS"}
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}