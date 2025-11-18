"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavbarUser() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    router.push("/login/users");
  };

  return (
    <div className="min-h-screen bg-[#4F0F0F]">

      {/* ================= NAVBAR ================= */}
      <nav className="w-full bg-[#7A1616] text-white px-5 py-3 flex items-center justify-between shadow-lg">
        
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <div onClick={() => router.push("/")} className="cursor-pointer flex items-center gap-2">
            <img src="/A-logo.png" className="w-8 h-8" />
            <span className="font-bold text-lg">SHOP</span>
          </div>

          <button className="bg-[#8C1B1B] hover:bg-[#9a1d1d] px-4 py-2 rounded-md text-sm">
            Kategori
          </button>

          <div className="bg-[#8C1B1B] flex items-center px-3 py-2 rounded-md w-[350px]">
            <input
              type="text"
              className="bg-transparent outline-none w-full text-white placeholder-gray-200 text-sm"
              placeholder="Cari di Ashura"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer text-xl">
            🛒
            <span className="absolute -top-2 -right-3 bg-pink-500 text-xs px-1 rounded-full">9</span>
          </div>

          <div className="cursor-pointer text-xl">🔔</div>
          <div className="cursor-pointer text-xl">✉️</div>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => router.push("/dashboard/user")}
                className="bg-white text-black font-bold w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
              >
                {user.username?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <button onClick={logout} className="bg-black/40 px-3 py-1 rounded-md text-sm">Logout</button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login/users")}
              className="bg-white text-black px-4 py-2 rounded-md font-semibold text-sm"
            >
              Masuk
            </button>
          )}
        </div>

      </nav>

      {/* ================= HERO BANNER ================= */}
      <section className="w-full mt-1">
        <div className="relative w-full h-[260px] md:h-[320px] overflow-hidden">

          {/* Banner */}
          <img
            src="/hero.jpg"
            alt="Hero Banner"
            className="w-full h-full object-cover"
          />

          {/* TEXT */}
          <div className="absolute top-10 left-10 text-orange-400 font-bold text-3xl md:text-4xl drop-shadow-xl">
            Discover New <br />
            Collection
          </div>

          {/* LEFT BUTTON */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
            type="button"
          >
            <img src="/left.svg" className="w-5 h-5" />
          </button>

          {/* RIGHT BUTTON */}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
            type="button"
          >
            <img src="/right.svg" className="w-5 h-5" />
          </button>

        </div>
      </section>

      {/* ================= PRODUK EKSKLUSIF ================= */}
      <section className="w-full flex justify-center mt-6 mb-10 px-4">
        <div className="w-full max-w-5xl bg-[#7A1616] border border-[#9a3a3a] rounded-xl px-6 py-5 shadow-xl">
          <h2 className="text-center text-white font-bold text-lg mb-4">Produk Eksklusif</h2>

          <div className="flex justify-between gap-4 md:gap-8">

            {/* CARD 1 */}
            <div className="flex flex-col w-32 md:w-40 bg-black rounded-md overflow-hidden shadow-lg">
              <div className="h-24 md:h-28 bg-gray-300" />
              <div className="flex-1 flex flex-col items-center justify-between py-2 text-white text-xs">
                <div className="text-center leading-tight">Nama produk <br /> Harga</div>
                <button className="mt-2 bg-gray-200 text-black text-[10px] px-4 py-1 rounded">beli</button>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="w-32 md:w-40 h-40 md:h-44 bg-black rounded-md shadow-lg" />

            {/* CARD 3 */}
            <div className="w-32 md:w-40 h-40 md:h-44 bg-black rounded-md shadow-lg" />

            {/* CARD 4 */}
            <div className="w-32 md:w-40 h-40 md:h-44 bg-black rounded-md shadow-lg" />

          </div>
        </div>
      </section>

    </div>
  );
}
