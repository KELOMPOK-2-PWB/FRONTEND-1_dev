"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../component/Element/Navbar"; // Sesuaikan path jika perlu
import axios from "axios";

// --- KONFIGURASI API ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": BACKEND_TOKEN || "",
  },
});

// TYPE DEFINITIONS
interface ReviewUser {
  _id: string;
  name: string;
}

interface ReviewItem {
  _id: string;
  user: ReviewUser;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewResponse {
  message: string;
  count: number;
  data: ReviewItem[];
}

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil parameter dari URL

  // 🔥 FIX UTAMA: Coba ambil ID dari 'productId' ATAU 'id'
  // Ini menangani kasus jika nama folder Anda [id] atau [productId]
  const productId = (params?.productId || params?.id) as string;

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Debugging: Lihat di Console Browser apakah ID terbaca
  useEffect(() => {
    console.log("DEBUG: Params dari URL ->", params);
    console.log("DEBUG: ProductId yang dipakai ->", productId);
  }, [params, productId]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      router.push("/login/users");
    }

    if (productId) {
      fetchReviews();
    } else {
        setLoading(false); 
    }
  }, [productId, router]);

  const fetchReviews = async () => {
    try {
      // GET review list
      const response = await api.get<ReviewResponse>(`/api/reviews/${productId}`);
      if (response.data && Array.isArray(response.data.data)) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error("Gagal load review:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi ID sebelum kirim
    if (!productId || productId === "undefined") {
        alert("Gagal: ID Produk tidak valid. Mohon refresh halaman.");
        return;
    }

    setSubmitting(true);

    try {
      // Endpoint: /api/reviews/:productId
      const url = `/api/reviews/${productId}`;
      
      // Body: Hanya rating & comment (Sesuai request Anda, tanpa orderId)
      const payload = {
        rating: Number(rating),
        comment: comment
      };
      
      console.log("Mengirim review ke:", url);
      console.log("Data:", payload);

      await api.post(url, payload);
      
      alert("Review berhasil dikirim!");
      setComment("");
      setRating(5);
      fetchReviews(); // Refresh daftar review
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mengirim review";
      alert(`Gagal: ${msg}`);
      console.error("Error submit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Komponen Bintang
  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'} ${
              star <= (interactive ? rating : count) ? "text-yellow-400" : "text-gray-600"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!productId) {
    return (
        <div className="min-h-screen bg-[#4F0F0F] flex items-center justify-center text-white">
            <div className="text-center p-6 bg-red-900/20 border border-red-500 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Error URL</h2>
                <p>ID Produk tidak ditemukan.</p>
                <p className="text-sm text-gray-400 mt-2">Pastikan URL browser memiliki ID produk.</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Kembali</button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4F0F0F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />

      <main className="max-w-4xl mx-auto px-4 pt-[100px]">
        <button onClick={() => router.back()} className="mb-6 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
           ← Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KOLOM KIRI: Form Input Review */}
          <div className="bg-[#2a0505] p-6 rounded-xl border border-[#5c1010] shadow-lg h-fit">
            <h2 className="text-xl font-bold mb-4 text-[#E53935] border-b border-[#3f0e0e] pb-3">Tulis Ulasan</h2>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Rating Produk</label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Komentar</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Bagaimana kualitas produk ini?"
                  className="w-full bg-[#1a0303] border border-[#3f0e0e] rounded-lg p-3 text-white focus:border-[#E53935] outline-none placeholder-gray-600"
                  required
                />
              </div>

              <button 
                disabled={submitting}
                className="w-full bg-[#E53935] hover:bg-[#d32f2f] text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: Daftar Review */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              Ulasan Pembeli <span className="text-sm bg-[#E53935] px-2 py-0.5 rounded-full">{reviews.length}</span>
            </h2>

            <div className="space-y-4">
              {loading ? (
                 <div className="text-center py-10 text-gray-400 animate-pulse">Memuat ulasan...</div>
              ) : reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="bg-[#2a0505] p-5 rounded-lg border border-[#3f0e0e] hover:border-[#5c1010] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase border border-gray-600">
                            {rev.user?.name?.[0] || "U"}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{rev.user?.name || "User"}</p>
                            <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString("id-ID")}</p>
                         </div>
                      </div>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mt-2">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-[#5c1010] rounded-lg bg-[#2a0505]/30">
                  <p className="text-gray-400 italic">Belum ada ulasan untuk produk ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}