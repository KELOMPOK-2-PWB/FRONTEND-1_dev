"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // TODO: nanti isi dari backend / context
  const [cartItems] = useState<any[]>([]);
  const [notifItems] = useState<any[]>([]);
  const [messageItems] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    router.push("/login/users");
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
    setIsNotifOpen(false);
    setIsMessageOpen(false);
  };

  const toggleNotif = () => {
    setIsNotifOpen((prev) => !prev);
    setIsCartOpen(false);
    setIsMessageOpen(false);
  };

  const toggleMessage = () => {
    setIsMessageOpen((prev) => !prev);
    setIsCartOpen(false);
    setIsNotifOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[#7A1616] text-white shadow-lg">
      {/* WRAPPER BIAR TATA LETAK RAPI */}
      <div className="px-5 py-3 flex items-center w-full">
        {/* LEFT: logo + kategori */}
        <div className="flex items-center gap-4 w-[25%] min-w-[220px]">
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer flex items-center gap-2"
          >
            {/* logo A agak lebih besar */}
            <img src="/A-logo.png" className="w-10 h-10" />
            <span className="font-bold text-xl">SHOP</span>
          </div>

          <button className="bg-[#8C1B1B] hover:bg-[#9a1d1d] px-4 py-2 rounded-md text-sm">
            Kategori
          </button>
        </div>

        {/* CENTER: search bar tepat di tengah */}
        <div className="flex-1 flex justify-center">
          <div className="bg-[#8C1B1B] flex items-center px-3 py-2 rounded-md w-full max-w-[500px]">
            <input
              type="text"
              className="bg-transparent outline-none w-full text-white placeholder-gray-200 text-sm"
              placeholder="Cari di Ashura"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT: keranjang, notif, pesan, user */}
        <div className="flex items-center gap-6 w-[25%] min-w-[220px] justify-end relative">
          {/* Keranjang */}
          <div className="relative cursor-pointer text-xl" onClick={toggleCart}>
            🛒
            <span className="absolute -top-2 -right-3 bg-pink-500 text-xs px-1 rounded-full">
              {cartItems.length}
            </span>
          </div>

          {/* Notifikasi */}
          <div className="relative cursor-pointer text-xl" onClick={toggleNotif}>
            🔔
            {notifItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-green-500 text-xs px-1 rounded-full">
                {notifItems.length}
              </span>
            )}
          </div>

          {/* Pesan */}
          <div className="relative cursor-pointer text-xl" onClick={toggleMessage}>
            ✉️
            {messageItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-500 text-xs px-1 rounded-full">
                {messageItems.length}
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => router.push("/dashboard/user")}
                className="bg-white text-black font-bold w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
              >
                {user.username?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <button
                onClick={logout}
                className="bg-black/40 px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login/users")}
              className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm"
            >
              Masuk
            </button>
          )}

          {/* PANEL KERANJANG (DROPDOWN) */}
          {isCartOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#7A1616] border border-[#9a3a3a] rounded-md shadow-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">
                  Keranjang ({cartItems.length})
                </span>
                <button
                  className="text-xs underline"
                  onClick={() => router.push("/cart")}
                >
                  Lihat
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="text-xs text-gray-200">Keranjang masih kosong.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto flex flex-col gap-2 text-xs">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b border-white/10 pb-1"
                    >
                      <div>
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-200">
                          x{item.quantity}
                        </p>
                      </div>
                      <span>{item.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL NOTIFIKASI (DROPDOWN) */}
          {isNotifOpen && (
            <div className="absolute right-16 top-full mt-2 w-72 bg-[#7A1616] border border-[#9a3a3a] rounded-md shadow-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Notifikasi</span>
                <button
                  className="text-xs underline"
                  onClick={() => router.push("/notifications")}
                >
                  Lihat semua
                </button>
              </div>

              {notifItems.length === 0 ? (
                <p className="text-xs text-gray-200">
                  Belum ada notifikasi baru.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto flex flex-col gap-2 text-xs">
                  {notifItems.map((notif, idx) => (
                    <div
                      key={idx}
                      className="border-b border-white/10 pb-2 last:border-0 last:pb-0"
                    >
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-[10px] text-gray-200">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL PESAN (DROPDOWN) */}
          {isMessageOpen && (
            <div className="absolute right-28 top-full mt-2 w-72 bg-[#7A1616] border border-[#9a3a3a] rounded-md shadow-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Pesan</span>
                <button
                  className="text-xs underline"
                  onClick={() => router.push("/messages")}
                >
                  Lihat semua
                </button>
              </div>

              {messageItems.length === 0 ? (
                <p className="text-xs text-gray-200">
                  Belum ada pesan baru.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto flex flex-col gap-2 text-xs">
                  {messageItems.map((msg, idx) => (
                    <div
                      key={idx}
                      className="border-b border-white/10 pb-2 last:border-0 last:pb-0"
                    >
                      <p className="font-medium truncate">{msg.from}</p>
                      <p className="text-[10px] text-gray-200 truncate">
                        {msg.preview}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
