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
  quantity: number;
  images?: string[];
};

type OrderItem = {
  product: { name: string };
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  uniqueCode: string;
  status: string;
  paymentProof?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: {
    product: {
      name: string;
      price: number;
      images?: string[];
    };
    quantity: number;
    price: number;
  }[];
};

type SellerProfile = {
  name: string;
  email: string;
  phoneNumber: string;
};

type Address = {
  _id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

/* ================= PAGE ================= */
export default function SellerDashboardPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===== PROFILE STATE ===== */
  const [profile, setProfile] = useState<SellerProfile>({
    name: "",
    email: "",
    phoneNumber: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "produk" | "pesanan" | "profile"
  >("dashboard");
  /* ===== THEME MODE ===== */
const [isDark, setIsDark] = useState(true);

useEffect(() => {
  const savedTheme = localStorage.getItem("seller_theme");
  if (savedTheme === "light") setIsDark(false);
}, []);

const toggleTheme = () => {
  const next = !isDark;
  setIsDark(next);
  localStorage.setItem("seller_theme", next ? "dark" : "light");
};

  /* ================= AUTH ================= */
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    const u = localStorage.getItem("userData");

    if (!t || !u) {
      router.replace("/login");
      return;
    }

    if (JSON.parse(u).role !== "seller") {
      router.replace("/");
      return;
    }

    setToken(t);
  }, [router]);

  const headers = {
    Authorization: `Bearer ${token}`,
    "x-api-key": BACKEND_TOKEN,
    "Content-Type": "application/json",
  };

  /* ================= PRODUK ================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${BASE_URL}/api/products`, { headers })
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : d.data || []))
      .finally(() => setLoading(false));
  }, [token]);

  /* ================= PESANAN ================= */
  useEffect(() => {
    if (!token || activeMenu !== "pesanan") return;

    fetch(`${BASE_URL}/api/seller/orders`, { headers })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d.data) ? d.data : []));
  }, [token, activeMenu]);

  /* ================= PROFILE ================= */
  useEffect(() => {
    if (!token || activeMenu !== "profile") return;

    fetch(`${BASE_URL}/api/seller/profile`, { headers })
      .then((r) => r.json())
      .then((d) =>
        setProfile({
          name: d.name || "",
          email: d.email || "",
          phoneNumber: d.phoneNumber || "",
        })
      );

    fetch(`${BASE_URL}/api/seller/address-seller`, { headers })
      .then((r) => r.json())
      .then((d) => setAddresses(Array.isArray(d) ? d : []));
  }, [token, activeMenu]);

  const processOrder = async (orderId: string) => {
    const res = await fetch(
      `${BASE_URL}/api/seller/orders/${orderId}/process`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: "Status diubah menjadi Sedang Dikemas",
          status: "packing",
        }),
      },
    );

    const data = await res.json();
    alert(data.message || "Pesanan diproses");
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: "packing" } : o)),
    );
  };

  const shipOrder = async (orderId: string) => {
    const resiOrder = prompt("Masukkan nomor resi");
    const courier = prompt("Masukkan nama kurir");

    if (!resiOrder || !courier) return;

    const res = await fetch(`${BASE_URL}/api/seller/orders/${orderId}/ship`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        resiOrder,
        courier,
      }),
    });

    const data = await res.json();
    alert(data.message || "Pesanan dikirim");

    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: "sent" } : o)),
    );
  };
  /* ================= ACTION ================= */
  const updateProfile = async () => {
    await fetch(`${BASE_URL}/api/seller/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(profile),
    });
    alert("Profile berhasil diperbarui");
  };

  const changePassword = async () => {
    await fetch(`${BASE_URL}/api/seller/change-password-seller`, {
      method: "PUT",
      headers,
      body: JSON.stringify(passwordForm),
    });
    alert("Password berhasil diubah");
    setPasswordForm({ currentPassword: "", newPassword: "" });
  };

  const addAddress = async () => {
    const street = prompt("Street");
    const city = prompt("City");
    const province = prompt("Province");
    const postalCode = prompt("Postal Code");
    if (!street || !city || !province || !postalCode) return;

    await fetch(`${BASE_URL}/api/seller/address-seller`, {
      method: "POST",
      headers,
      body: JSON.stringify({ street, city, province, postalCode }),
    });

    const res = await fetch(`${BASE_URL}/api/seller/address-seller`, {
      headers,
    });
    setAddresses(await res.json());
  };

  const deleteAddress = async (id: string) => {
    await fetch(`${BASE_URL}/api/users/address/${id}`, {
      method: "DELETE",
      headers,
    });
    setAddresses((p) => p.filter((a) => a._id !== id));
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
    <div
  className={`min-h-screen flex transition-colors duration-300 ${
    isDark
      ? "bg-gradient-to-br from-[#4F0F0F] via-[#6A1414] to-[#4F0F0F] text-white"
      : "bg-gray-100 text-black"
  }`}
>



      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#2a0505] border-r border-[#5c1010] p-6 space-y-2 shadow-xl">

    <div className="flex items-center gap-3 mb-8">
  <div className="w-12 h-12 rounded-full bg-[#3f0e0e] border-2 border-[#E53935] shadow-[0_0_15px_rgba(229,57,53,0.6)] flex items-center justify-center overflow-hidden">
    <img
      src="/A-logo.png"
      alt="A Logo"
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
    
    <span className="font-extrabold text-xl text-[#E53935]">A</span>
  </div>

  <div>
   
    <p className="text-[11px] text-gray-400 -mt-0.5">
      Seller Dashboard
    </p>
  </div>
</div>

        {["dashboard", "produk", "pesanan", "profile"].map((m) => (
          <button
            key={m}
            onClick={() => setActiveMenu(m as any)}
           className={`w-full text-left px-4 py-2.5 rounded-lg font-bold transition ${
  activeMenu === m
    ? "bg-[#E53935] shadow-lg"
    : "hover:bg-[#3f0e0e]"
}`}

          >
            {m === "dashboard"
              ? "Dashboard"
              : m === "produk"
                ? "Produk"
                : m === "pesanan"
                  ? "Daftar Pesanan"
                  : "Profile"}
          </button>
        ))}

        <button
          onClick={logout}
          className="mt-6 bg-black/50 w-full py-2 rounded hover:bg-black"
        >
          Logout
        </button>
      </aside>
<button
  onClick={toggleTheme}
  title="Mode Pagi / Malam"
  className={`w-9 h-9 rounded-full flex items-center justify-center border transition mb-4 ${
    isDark
      ? "bg-[#3f0e0e] border-[#5c1010] hover:bg-[#4a1212]"
      : "bg-white border-gray-300 hover:bg-gray-200"
  }`}
>
  <span className="text-lg">
    {isDark ? "🌙" : "☀️"}
  </span>
</button>

      {/* MAIN */}
     <main className="flex-1 p-8 space-y-6">
        {activeMenu === "dashboard" && (
          <h1 className="text-xl font-bold">
            Selamat Datang di Dashboard Seller 👋
          </h1>
        )}

        {activeMenu === "produk" && (
          <>
            <div className="flex justify-between mb-6">
              <h1 className="text-xl font-bold">Produk</h1>
              <button
                onClick={() => router.push("/dashboardseller/tambah-produk")}
                className="bg-[#E53935] hover:bg-[#d32f2f] px-4 py-2 rounded-lg font-bold shadow"

              >
                Tambahkan Produk
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((p) => (
              <div
  key={p._id}
  className="bg-[#2a0505] border border-[#5c1010] rounded-xl shadow-lg overflow-hidden hover:bg-[#320606] transition"
>
                 <div className="p-4 text-white">
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold">{p.name}</p>
                    <p>Rp {p.price.toLocaleString("id-ID")}</p>
                    <p>Stok: {p.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeMenu === "pesanan" && (
          <>
            <h1 className="text-xl font-bold mb-6">Daftar Pesanan Masuk</h1>

            {orders.length === 0 && (
              <p className="text-white/70">Belum ada pesanan</p>
            )}

            <div className="space-y-4">
              {orders.map((o) => (
                <div
  key={o._id}
  className="bg-[#2a0505] border border-[#5c1010] p-5 rounded-xl shadow-lg text-white"
>
                  <div className="flex justify-between mb-2">
                    <b>{o.uniqueCode}</b>
                    <span className="text-sm">Status: {o.status}</span>
                  </div>

                  <p className="text-sm">
                    Pembeli: {o.user.name} ({o.user.email})
                  </p>

                  <p className="text-sm">
                    Alamat: {o.shippingAddress.street}, {o.shippingAddress.city}
                  </p>

                  <div className="mt-3 border-t pt-2">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {i.product.name} × {i.quantity}
                        </span>
                        <span>Rp {i.price.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {["waiting_verification", "processed"].includes(
                      o.status,
                    ) && (
                      <button
                        onClick={() => processOrder(o._id)}
                        className="bg-yellow-500 px-3 py-1 rounded text-white text-sm cursor-pointer relative z-10"
                      >
                        Packing Barang
                      </button>
                    )}

                    {o.status === "packing" && (
                      <button
                        onClick={() => shipOrder(o._id)}
                        className="bg-green-600 px-3 py-1 rounded text-white text-sm cursor-pointer relative z-10"
                      >
                        Kirim Barang
                      </button>
                    )}

                    {o.status === "sent" && (
                      <span className="text-sm text-green-700 font-semibold">
                        Pesanan sudah dikirim
                      </span>
                    )}
                  </div>
                  {o.paymentProof && (
                    <a
                      href={o.paymentProof}
                      target="_blank"
                      className="inline-block mt-3 text-blue-600 underline text-sm"
                    >
                      Lihat Bukti Pembayaran
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeMenu === "profile" && (
          <>
            <h1 className="text-xl font-bold mb-6">Profil Toko</h1>

            {/* BIODATA */}
            <div className="bg-[#2a0505] border border-[#5c1010] p-6 rounded-xl mb-6 max-w-xl shadow-lg">
              <h2 className="font-bold mb-3">Biodata</h2>

              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full mb-2 p-2 rounded bg-[#3f0e0e] border border-[#5c1010] text-white outline-none focus:border-[#E53935]"

              />

              <input
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full mb-2 p-2 rounded bg-[#3f0e0e] border border-[#5c1010] text-white outline-none focus:border-[#E53935]"
              />

              <input
                value={profile.phoneNumber}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full mb-3 p-2 rounded text-black"
              />

              <button
                onClick={updateProfile}
                className="bg-[#E53935] hover:bg-[#d32f2f] px-4 py-2 rounded-lg font-bold shadow"

              >
                Simpan Profil
              </button>
            </div>

            {/* PASSWORD */}
            <div className="bg-[#8B1D1D] p-6 rounded mb-6 max-w-xl">
              <h2 className="font-bold mb-3">Ubah Password</h2>

              <input
                type="password"
                placeholder="Password Lama"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full mb-2 p-2 rounded text-black"
              />

              <input
                type="password"
                placeholder="Password Baru"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full mb-3 p-2 rounded text-black"
              />

              <button
                onClick={changePassword}
                className="bg-black px-4 py-2 rounded"
              >
                Ubah Password
              </button>
            </div>

            {/* ALAMAT */}
            <div className="bg-[#8B1D1D] p-6 rounded max-w-xl">
              <h2 className="font-bold mb-3">Alamat</h2>

              {addresses.map((a) => (
                <div
                  key={a._id}
                  className="bg-white text-black p-2 rounded mb-2 flex justify-between"
                >
                  <span>{a.street}</span>
                  <button
                    onClick={() => deleteAddress(a._id)}
                    className="text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              ))}

              <button
                onClick={addAddress}
                className="mt-3 bg-black px-4 py-2 rounded"
              >
                Tambah Alamat
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
