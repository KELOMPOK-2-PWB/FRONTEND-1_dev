"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

/* ================= TYPES ================= */
type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
};

/* ================= PAGE ================= */
export default function SellerDashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ MENU STATE
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "produk" | "pesanan" | "saldo" | "rekening"
  >("dashboard");

  /* ================= AUTH ================= */
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    const userRaw = localStorage.getItem("userData");

    if (!t || !userRaw) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userRaw);
    if (user.role !== "seller") {
      router.replace("/");
      return;
    }

    setToken(t);
  }, []);

  /* ================= HEADERS ================= */
  const headers = {
    Authorization: `Bearer ${token}`,
    "x-api-key": BACKEND_TOKEN || "",
    "Content-Type": "application/json",
  };

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products`, {
          headers,
        });

        if (!res.ok) throw new Error("Gagal ambil produk");

        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil produk seller");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Yakin hapus produk ini?")) return;

    await fetch(`${BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      headers,
    });

    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#7A1F1F] text-white">
        Loading Seller Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#7A1F1F] text-white">

      {/* ========== SIDEBAR ========== */}
      <aside className="w-[240px] bg-[#8B1D1D] p-6 space-y-2">
        <h2 className="font-bold text-lg mb-4">A SHOP</h2>

        <button
          onClick={() => setActiveMenu("dashboard")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeMenu === "dashboard"
              ? "bg-red-600"
              : "hover:bg-black/40"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => setActiveMenu("produk")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeMenu === "produk"
              ? "bg-red-600"
              : "hover:bg-black/40"
          }`}
        >
          Produk
        </button>

        <button
          onClick={() => setActiveMenu("pesanan")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeMenu === "pesanan"
              ? "bg-red-600"
              : "hover:bg-black/40"
          }`}
        >
          Daftar Pesanan
        </button>

        <button
          onClick={() => setActiveMenu("saldo")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeMenu === "saldo"
              ? "bg-red-600"
              : "hover:bg-black/40"
          }`}
        >
          Saldo
        </button>

        <button
          onClick={() => setActiveMenu("rekening")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeMenu === "rekening"
              ? "bg-red-600"
              : "hover:bg-black/40"
          }`}
        >
          Rekening
        </button>

        <button
          onClick={logout}
          className="mt-6 bg-black/50 w-full py-2 rounded hover:bg-black"
        >
          Logout
        </button>
      </aside>

      {/* ========== MAIN ========== */}
      <main className="flex-1 p-8">

        {/* DASHBOARD */}
        {activeMenu === "dashboard" && (
          <h1 className="text-xl font-bold">
            Selamat Datang di Dashboard Seller 👋
          </h1>
        )}

        {/* PRODUK */}
        {activeMenu === "produk" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Produk</h1>
              <button
                onClick={() =>
                  router.push("/dashboardseller/tambah-produk")
                }
                className="bg-black px-4 py-2 rounded"
              >
                Tambahkan Produk
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p._id} className="bg-white text-black rounded">
                  <div className="h-[150px] bg-gray-200" />
                  <div className="p-4">
                    <p className="font-bold">{p.name}</p>
                    <p>Rp {p.price.toLocaleString()}</p>
                    <p className="text-sm">Stok: {p.quantity}</p>

                    <div className="flex gap-2 mt-4">
                      <button className="bg-black text-white px-3 py-1 rounded text-sm">
                        Ubah
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MENU LAIN */}
        {activeMenu !== "dashboard" && activeMenu !== "produk" && (
          <p className="text-white/70">
            Fitur <b>{activeMenu}</b> belum diimplementasikan
          </p>
        )}

      </main>
    </div>
  );
}
