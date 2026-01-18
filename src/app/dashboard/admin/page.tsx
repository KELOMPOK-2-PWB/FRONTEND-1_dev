"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN!;

/* ================= TYPES ================= */
type Seller = {
  _id: string;
  name: string;
  email: string;
  isVerifiedAccount: boolean;
};

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

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [activeMenu, setActiveMenu] =
    useState<"barang" | "pembayaran">("barang");

  /* ================= TOKEN ================= */
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (!t) {
      router.replace("/login/admin");
    } else {
      setToken(t);
    }
  }, [router]);

  /* ================= HEADERS ================= */
  const adminHeaders: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "x-api-key": BACKEND_TOKEN,
    "Content-Type": "application/json",
  };

  /* ================= FETCH DASHBOARD ================= */
  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [sellerRes, productRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/sellers`, { headers: adminHeaders }),
          fetch(`${BASE_URL}/api/admin/productsSeller`, {
            headers: adminHeaders,
          }),
        ]);

        if (!sellerRes.ok || !productRes.ok) {
          throw new Error("Unauthorized");
        }

        const sellerData = await sellerRes.json();
        const productData = await productRes.json();

        setSellers(sellerData.data || []);
        setProducts(productData.data || []);
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data admin");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  /* ================= FETCH PAYMENT ================= */
  useEffect(() => {
    if (!token || activeMenu !== "pembayaran") return;

    const fetchPayments = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/orders/verification-list`,
          {
            method: "GET",
            headers: adminHeaders,
          }
        );

        const json = await res.json();
        console.log("PAYMENT RESPONSE:", json);

        setOrders(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("PAYMENT ERROR:", err);
        setOrders([]);
      }
    };

    fetchPayments();
  }, [token, activeMenu]);

  /* ================= ACTION ================= */
  const verifySeller = async (id: string, status: boolean) => {
    await fetch(`${BASE_URL}/api/admin/seller/${id}/verify`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ isVerifiedAccount: status }),
    });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`${BASE_URL}/api/admin/productSeller/Delete/${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    setProducts((prev) => prev.filter((p) => p._id !== id));
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

    setOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login/admin");
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#7A1F1F] text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#7A1F1F] text-white">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#7A1F1F] text-white">
      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#8B1D1D] p-6 space-y-3">
        <h2 className="font-bold mb-6">ADMIN PANEL</h2>

        <button
          onClick={() => setActiveMenu("barang")}
          className={`w-full py-2 rounded ${
            activeMenu === "barang"
              ? "bg-red-600"
              : "bg-black/30 hover:bg-black"
          }`}
        >
          Approval Barang
        </button>

        <button
          onClick={() => setActiveMenu("pembayaran")}
          className={`w-full py-2 rounded ${
            activeMenu === "pembayaran"
              ? "bg-red-600"
              : "bg-black/30 hover:bg-black"
          }`}
        >
          Approval Pembayaran
        </button>

        <button
          onClick={logout}
          className="mt-6 bg-black/40 w-full py-2 rounded hover:bg-black"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 space-y-8">
        {/* ===== APPROVAL BARANG ===== */}
        {activeMenu === "barang" && (
          <>
            <h1 className="text-xl font-bold">Produk Seller</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="bg-white text-black p-4 rounded">
                  <p className="font-bold">{p.name}</p>
                  <p>{p.category}</p>
                  <p>Rp {p.price.toLocaleString()}</p>
                  <p className="text-sm">Stok: {p.quantity}</p>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== APPROVAL PEMBAYARAN ===== */}
        {activeMenu === "pembayaran" && (
          <>
            <h1 className="text-xl font-bold">Approval Pembayaran</h1>

            {orders.length === 0 && (
              <p className="text-white/70">
                Tidak ada pesanan menunggu verifikasi
              </p>
            )}

            {orders.map((o) => (
              <div key={o._id} className="bg-white text-black p-4 rounded">
                <p className="font-bold">Kode: {o.uniqueCode}</p>
                <p>User: {o.user.name}</p>
                <p>Email: {o.user.email}</p>

                <a
                  href={o.paymentProof}
                  target="_blank"
                  className="text-blue-600 underline text-sm"
                >
                  Lihat Bukti Pembayaran
                </a>

                <div className="mt-2 text-sm">
                  {o.items.map((i, idx) => (
                    <p key={idx}>
                      {i.product.name} × {i.quantity} — Rp{" "}
                      {i.product.price.toLocaleString()}
                    </p>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => validatePayment(o._id, "approve")}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => validatePayment(o._id, "reject")}
                    className="bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
