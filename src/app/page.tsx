"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../component/Element/Navbar";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("authToken");

  console.log("TOKEN DI LOCALSTORAGE:", token);

  if (!token) {
    setError("Token tidak ditemukan. Silakan login ulang.");
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/products-users`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // standar
    "x-auth-token": token || "",      // jaga-jaga backend baca dari sini
    "x-api-key": BACKEND_TOKEN || "", // API key
  },
});

    const data = await res.json();

    console.log("RESPON BACKEND:", data);

    if (!res.ok) {
      throw new Error(data.message || "Gagal mengambil produk");
    }

    setProducts(Array.isArray(data) ? data : data.data || []);
  } catch (err: any) {
    console.error("ERROR FETCH:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


    fetchProducts();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  const eksklusifProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#4F0F0F]">
      {/* NAVBAR */}
      <Navbar />

      {/* ================= HERO BANNER ================= */}
      <section className="w-full mt-1">
        <div className="relative w-full h-[260px] md:h-[320px] overflow-hidden">
          <img
            src="/hero.jpg"
            alt="Hero Banner"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-10 left-10 text-orange-400 font-bold text-3xl md:text-4xl drop-shadow-xl">
            Discover New <br />
            Collection
          </div>

          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
            type="button"
          >
            <img src="/left.png" className="w-5 h-5" />
          </button>

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
            type="button"
          >
            <img src="/right.png" className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ================= PRODUK EKSKLUSIF ================= */}
      <section className="w-full flex justify-center mt-6 mb-10 px-4">
        <div className="w-full max-w-5xl bg-[#7A1616] border border-[#9a3a3a] rounded-xl px-6 py-5 shadow-xl">
          <h2 className="text-center text-white font-bold text-lg mb-4">
            Produk Eksklusif
          </h2>

          {loading && (
            <p className="text-center text-white text-sm">Memuat produk...</p>
          )}

          {error && !loading && (
            <p className="text-center text-red-200 text-sm">{error}</p>
          )}

          {!loading && !error && eksklusifProducts.length === 0 && (
            <p className="text-center text-white text-sm">
              Belum ada produk yang dapat ditampilkan.
            </p>
          )}

          {!loading && !error && eksklusifProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {eksklusifProducts.map((p) => {
                const imageUrl =
                  p.images?.find((url) => url && url.startsWith("http")) || "";

                return (
                  <div
                    key={p._id}
                    className="flex flex-col bg-black rounded-md overflow-hidden shadow-lg"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="h-24 md:h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="h-24 md:h-32 w-full bg-gray-300" />
                    )}

                    <div className="flex-1 flex flex-col justify-between py-2 px-2 text-white text-xs">
                      <div>
                        <p className="font-semibold truncate" title={p.name}>
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-300">
                          {p.category}
                        </p>

                        <p className="mt-1 text-[11px] font-bold">
                          {formatPrice(p.price)}
                          {p.discount > 0 && (
                            <span className="ml-1 text-[10px] text-green-400">
                              -{p.discount}%
                            </span>
                          )}
                        </p>
                      </div>

                      <button className="mt-2 bg-gray-200 text-black text-[10px] px-4 py-1 rounded self-center">
                        beli
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
