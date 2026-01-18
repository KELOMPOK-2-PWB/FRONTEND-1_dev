"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

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

type User = {
  _id: string;
  name: string;
  username: string;
  phoneNumber: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  // ✅ MENU STATE (UI ONLY)
  const [activeMenu, setActiveMenu] = useState<"barang" | "pembayaran">("barang");

  // ================= TOKEN =================
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (!t) {
      router.replace("/login/admin");
    } else {
      setToken(t);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchDashboard();
  }, [token]);

  const adminHeaders = {
    Authorization: `Bearer ${token}`,
    "x-api-key": BACKEND_TOKEN || "",
    "Content-Type": "application/json",
  };

  // ================= FETCH =================
  const fetchDashboard = async () => {
    try {
      const sellerRes = await fetch(`${BASE_URL}/api/admin/sellers`, { headers: adminHeaders });
      const productRes = await fetch(`${BASE_URL}/api/admin/productsSeller`, { headers: adminHeaders });
      const userRes = await fetch(`${BASE_URL}/api/admin/users`, { headers: adminHeaders });

      if (!sellerRes.ok || !productRes.ok) throw new Error("Unauthorized");

      const sellerData = await sellerRes.json();
      const productData = await productRes.json();

      setSellers(sellerData.data || []);
      setProducts(productData.data || []);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data admin");
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTION =================
  const verifySeller = async (id: string, status: boolean) => {
    await fetch(`${BASE_URL}/api/admin/seller/${id}/verify`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ isVerifiedAccount: status }),
    });
    fetchDashboard();
  };

  const banSeller = async (id: string, banned: boolean) => {
    await fetch(`${BASE_URL}/api/admin/userseller/banned/${id}?banned=${banned}`, {
      method: "PUT",
      headers: adminHeaders,
    });
    fetchDashboard();
  };

  const deleteSeller = async (id: string) => {
    if (!confirm("Yakin hapus seller dan semua produknya?")) return;
    await fetch(`${BASE_URL}/api/admin/sellers/delete/${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    fetchDashboard();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`${BASE_URL}/api/admin/productSeller/Delete/${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    fetchDashboard();
  };

  const banUser = async (id: string, banned: boolean) => {
    await fetch(`${BASE_URL}/api/admin/userseller/banned/${id}?banned=${banned}`, {
      method: "PUT",
      headers: adminHeaders,
    });
    fetchDashboard();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Yakin hapus user permanen?")) return;
    await fetch(`${BASE_URL}/api/admin/user/delete/${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    fetchDashboard();
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login/admin");
  };

  // ================= UI =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#7A1F1F] text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#7A1F1F] text-white gap-4">
        <p>{error}</p>
        <button onClick={() => router.push("/login/admin")} className="bg-red-600 px-6 py-2 rounded font-bold">
          Login Admin
        </button>
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
            activeMenu === "barang" ? "bg-red-600" : "bg-black/30 hover:bg-black"
          }`}
        >
          Approval Barang
        </button>

        <button
          onClick={() => setActiveMenu("pembayaran")}
          className={`w-full py-2 rounded ${
            activeMenu === "pembayaran" ? "bg-red-600" : "bg-black/30 hover:bg-black"
          }`}
        >
          Approval Pembayaran
        </button>

        <button onClick={logout} className="mt-6 bg-black/40 w-full py-2 rounded hover:bg-black">
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 space-y-10">

        {/* ================= APPROVAL BARANG ================= */}
        {activeMenu === "barang" && (
          <>
            {/* SELLER */}
            <section>
              <h1 className="text-xl font-bold mb-4">Approval Seller</h1>
              {sellers.map((s) => (
                <div key={s._id} className="bg-white text-black p-4 rounded flex justify-between mb-3">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-sm">{s.email}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!s.isVerifiedAccount && (
                      <>
                        <button onClick={() => verifySeller(s._id, true)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                          Approve
                        </button>
                        <button onClick={() => verifySeller(s._id, false)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                          Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => banSeller(s._id, true)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                      Ban
                    </button>
                    <button onClick={() => banSeller(s._id, false)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      Unban
                    </button>
                    <button onClick={() => deleteSeller(s._id)} className="bg-black text-white px-3 py-1 rounded text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </section>

            {/* PRODUCT */}
            <section>
              <h2 className="text-xl font-bold mb-4">Produk Seller</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p._id} className="bg-white text-black p-4 rounded">
                    <p className="font-bold">{p.name}</p>
                    <p>{p.category}</p>
                    <p>Rp {p.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Stok: {p.quantity}</p>
                    <button onClick={() => deleteProduct(p._id)} className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm">
                      Delete Produk
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ================= APPROVAL PEMBAYARAN ================= */}
        {activeMenu === "pembayaran" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Approval Pembayaran / User</h2>
            {users.map((u) => (
              <div key={u._id} className="bg-white text-black p-4 rounded flex justify-between mb-3">
                <div>
                  <p className="font-bold">{u.name}</p>
                  <p className="text-sm">@{u.username}</p>
                  <p className="text-xs">{u.phoneNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => banUser(u._id, true)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                    Ban
                  </button>
                  <button onClick={() => banUser(u._id, false)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Unban
                  </button>
                  <button onClick={() => deleteUser(u._id)} className="bg-black text-white px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

      </main>
    </div>
  );
}