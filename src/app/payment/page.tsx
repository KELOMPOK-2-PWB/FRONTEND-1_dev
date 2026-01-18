"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../component/Element/Navbar"; // Sesuaikan path navbar
import axios from "axios";

// --- KONFIGURASI ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

const UPLOAD_BASE = process.env.NEXT_PUBLIC_UPLOAD_BASE; 
const UPLOAD_APIKEY = process.env.NEXT_PUBLIC_UPLOAD_APIKEY;

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

export default function PaymentPage() {
  const router = useRouter();
  
  // State untuk menyimpan Order ID yang diambil dari LocalStorage
  const [orderId, setOrderId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>("");

  // 🔥 LOAD ORDER ID DARI STORAGE SAAT HALAMAN DIBUKA
  useEffect(() => {
    const savedOrderId = localStorage.getItem("current_order_id");
    
    if (!savedOrderId) {
        alert("Tidak ada tagihan yang ditemukan. Kembali ke keranjang.");
        router.push("/keranjang");
    } else {
        setOrderId(savedOrderId);
    }
  }, [router]);

  // --- HANDLE FILE UPLOAD ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("Maksimal ukuran file 5MB");
        return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Construct URL Uploader
      const uploadUrl = new URL(UPLOAD_BASE || ""); 
      if (UPLOAD_APIKEY) uploadUrl.searchParams.append("apikey", UPLOAD_APIKEY);

      // Upload ke External Server
      const res = await axios.post(uploadUrl.toString(), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Ambil URL dari response uploader
      if (res.data && res.data.url) {
        setPaymentProofUrl(res.data.url);
      } else {
        throw new Error("Gagal mendapatkan link gambar.");
      }

    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(`Gagal upload: ${error.message}`);
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  // --- CONFIRM PAYMENT ---
  const handleConfirmPayment = async () => {
    if (!paymentProofUrl) {
      alert("Harap upload bukti pembayaran!");
      return;
    }
    if (!orderId) {
        alert("Order ID hilang. Silakan ulangi checkout.");
        return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("authToken");
    setAuthToken(token);

    try {
      // Kirim URL bukti bayar ke Backend kita
      // Backend tetap butuh Order ID di URL API-nya
      const response = await api.post(`/api/orders/${orderId}/payment`, {
        paymentProofUrl: paymentProofUrl
      });

      if (response.status >= 200 && response.status < 300) {
        // Bersihkan ID dari storage agar tidak bisa dipake ulang
        localStorage.removeItem("current_order_id");
        
        alert("Pembayaran berhasil dikirim! Menunggu verifikasi admin.");
        router.push("/"); 
      }
    } catch (error: any) {
      console.error("Payment Confirm Error:", error);
      const msg = error.response?.data?.message || "Gagal konfirmasi pembayaran.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderId) {
      return (
        <div className="min-h-screen bg-[#7A1F1F] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#7A1F1F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />

      <main className="max-w-md mx-auto px-4 pt-[100px] flex flex-col items-center text-center">
        
        <h1 className="text-2xl font-bold mb-2">Selesaikan Pembayaran</h1>
        <p className="text-gray-200 text-sm mb-6">
          Order ID: <span className="font-mono bg-black/20 px-2 py-1 rounded">{orderId}</span>
        </p>

        {/* Card QRIS */}
        <div className="bg-white rounded-xl p-6 shadow-2xl w-full flex flex-col items-center mb-6">
          <p className="text-gray-800 font-bold mb-4 text-sm uppercase tracking-wide">
            Scan QRIS
          </p>
          
          <div className="relative w-full aspect-[3/4] max-w-[250px] border-2 border-gray-200 rounded-lg overflow-hidden mb-4">
            <Image 
              src="/qris-dana.png" 
              alt="QRIS Payment"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="w-full bg-blue-50 p-3 rounded text-left text-blue-800 text-xs leading-relaxed border border-blue-100">
            1. Buka aplikasi E-Wallet/Banking.<br/>
            2. Scan QRIS di atas.<br/>
            3. Masukkan nominal sesuai total tagihan.<br/>
            4. Upload bukti pembayaran di bawah.
          </div>
        </div>

        {/* Upload Bukti Bayar */}
        <div className="w-full bg-[#2a0505] border border-[#5c1010] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 border-b border-[#5c1010] pb-2">Upload Bukti Bayar</h3>
          
          {/* Preview Image */}
          <div className="mb-4 w-full h-48 bg-black/40 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center overflow-hidden relative">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-sm">Belum ada foto</span>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-2">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold animate-pulse">Mengupload...</span>
              </div>
            )}
          </div>

          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            disabled={uploading || submitting}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-[#7A1F1F] hover:file:bg-gray-200 mb-4 cursor-pointer disabled:opacity-50"
          />

          <button 
            onClick={handleConfirmPayment}
            // Disabled jika sedang submit, upload, bukti kosong, atau ID tidak ada
            disabled={submitting || uploading || !paymentProofUrl || !orderId}
            className={`w-full py-3.5 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${
              submitting || uploading || !paymentProofUrl
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-white text-[#7A1F1F] hover:bg-gray-100"
            }`}
          >
            {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
          </button>
        </div>

      </main>
    </div>
  );
}