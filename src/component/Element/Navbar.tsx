"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
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
    <nav className="w-full bg-[#7A1616] text-white px-5 py-3 flex items-center justify-between shadow-lg 
    fixed top-0 left-0 z-50">
      
      {/* LEFT */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-2"
        >
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
          <span className="absolute -top-2 -right-3 bg-pink-500 text-xs px-1 rounded-full">
            9
          </span>
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
      </div>
    </nav>
  );
}
