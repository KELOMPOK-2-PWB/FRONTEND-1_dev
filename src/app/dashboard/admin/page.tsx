"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN!;

/* ================= TYPES ================= */
type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
};

type OrderItem = {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
};

type Order = {
  _id: string;
  uniqueCode: string;
  paymentProof: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
};

/* ================= PAGE ================= */
export default function AdminDashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeMenu, setActiveMenu] =
    useState<"barang" | "pembayaran">("barang");

  /* ================= THEME ================= */
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_theme");
    if (t === "light") setIsDark(false);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("admin_theme", next ? "dark" : "light");
  };

  /* ================= TOKEN ================= */
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (!t) router.replace("/login/admin");
    else setToken(t);
  }, [router]);

  /* ================= HEADERS ================= */
  const adminHeaders: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "x-api-key": BACKEND_TOKEN,
    "Content-Type": "application/json",
  };

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/api/admin/productsSeller`,
          { headers: adminHeaders }
        );
        const json = await res.json();
        setProducts(json.data || []);
      } catch {
        setError("Gagal mengambil data admin");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* ================= FETCH PAYMENTS ================= */
  useEffect(() => {
    if (!token || activeMenu !== "pembayaran") return;

    fetch(`${BASE_URL}/api/orders/verification-list`, {
      headers: adminHeaders,
    })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d.data) ? d.data : []));
  }, [token, activeMenu]);

  /* ================= ACTION ================= */
  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`${BASE_URL}/api/admin/productSeller/Delete/${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    setProducts((p) => p.filter((x) => x._id !== id));
  };

  const validatePayment = async (
    orderId: string,
    action: "approve" | "reject"
  ) => {
    if (!confirm(`Yakin ${action.toUpperCase()} pembayaran ini?`)) return;

    await fetch(`${BASE_URL}/api/orders/${orderId}/validate`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ action }),
    });

    setOrders((o) => o.filter((x) => x._id !== orderId));
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login/admin");
  };

  /* ================= UI ================= */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#4F0F0F] text-white">
        Loading Admin Dashboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#4F0F0F] text-white">
        {error}
      </div>
    );

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-[#4F0F0F] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`w-[260px] p-6 flex flex-col justify-between border-r ${
          isDark
            ? "bg-[#2a0505] border-[#5c1010]"
            : "bg-white border-gray-200"
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-3 items-center">
              <img src="/A-logo.png" className="w-10 h-10" />
              <h2 className="font-extrabold text-red-500">ADMIN PANEL</h2>
            </div>

            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isDark ? "bg-[#3f0e0e]" : "bg-gray-200"
              }`}
            >
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>

          <button
            onClick={() => setActiveMenu("barang")}
            className={`w-full py-3 px-4 rounded-lg font-bold text-left mb-2 ${
              activeMenu === "barang"
                ? "bg-[#E53935]"
                : isDark
                ? "hover:bg-[#3f0e0e]"
                : "hover:bg-gray-200"
            }`}
          >
            Approval Barang
          </button>

          <button
            onClick={() => setActiveMenu("pembayaran")}
            className={`w-full py-3 px-4 rounded-lg font-bold text-left ${
              activeMenu === "pembayaran"
                ? "bg-[#E53935]"
                : isDark
                ? "hover:bg-[#3f0e0e]"
                : "hover:bg-gray-200"
            }`}
          >
            Approval Pembayaran
          </button>
        </div>

        <button
          onClick={logout}
          className="bg-black/60 hover:bg-black py-3 rounded-lg font-bold text-white"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-10 py-8 space-y-8">
        {/* BARANG */}
        {activeMenu === "barang" && (
          <>
            <h1 className="text-2xl font-bold">Produk Seller</h1>

            <div className="grid md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  className={`p-6 rounded-xl shadow ${
                    isDark
                      ? "bg-[#2a0505] border border-[#5c1010]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm opacity-70">{p.category}</p>
                  <p className="text-red-500 font-semibold mt-2">
                    Rp {p.price.toLocaleString()}
                  </p>
                  <p className="text-sm">Stok: {p.quantity}</p>

                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-bold text-sm"
                  >
                    Hapus Produk
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PEMBAYARAN (INI YANG BALIK) */}
        {activeMenu === "pembayaran" && (
          <>
            <h1 className="text-2xl font-bold">Approval Pembayaran</h1>

            {orders.length === 0 && (
              <p className="opacity-70">Tidak ada pesanan</p>
            )}

            <div className="space-y-6">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className={`p-6 rounded-xl shadow ${
                    isDark
                      ? "bg-[#2a0505] border border-[#5c1010]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <b>{o.uniqueCode}</b>
                    <span className="text-sm opacity-70">
                      {o.status}
                    </span>
                  </div>

                  <p className="text-sm mb-2">
                    {o.user.name} — {o.user.email}
                  </p>

                  <a
                    href={o.paymentProof}
                    target="_blank"
                    className="text-blue-500 underline text-sm"
                  >
                    Lihat Bukti Pembayaran
                  </a>

                  {/* ITEM PESANAN (BALIK LAGI) */}
                  <div className="mt-4 border-t pt-3 space-y-1 text-sm">
                    {o.items.map((i, idx) => (
                      <p key={idx}>
                        {i.product.name} × {i.quantity} — Rp{" "}
                        {i.product.price.toLocaleString()}
                      </p>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() =>
                        validatePayment(o._id, "approve")
                      }
                      className="bg-green-600 px-4 py-2 rounded text-white font-bold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        validatePayment(o._id, "reject")
                      }
                      className="bg-red-600 px-4 py-2 rounded text-white font-bold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
