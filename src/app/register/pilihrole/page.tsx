"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterSelectRole() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"user" | "seller" | null>(null);

  const handleDaftar = () => {
    if (!selectedRole) return;
    if (selectedRole === "user") router.push("/register/users");
    if (selectedRole === "seller") router.push("/register/seller");
  };

  return (
    <div
      className={`flex min-h-screen flex-col md:flex-row items-center justify-center transition-colors duration-500 ${
        darkMode ? "bg-[#0D0D0D]" : "bg-white"
      }`}
    >
      {/* LEFT LOGO */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img
          src="/A-logo.png"
          alt="Ashura Logo"
          className="w-[500px] h-[500px] object-contain"
        />
      </div>

      {/* RIGHT CARD */}
      <div className="flex flex-1 items-center justify-center relative w-full">
        
        {/* MODE TOGGLE */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute top-6 right-6 p-2 rounded-full transition duration-300 border ${
            darkMode
              ? "bg-white/10 text-white border-gray-600 hover:bg-white/20"
              : "bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
          }`}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div
          className={`w-full max-w-md rounded-[10px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-6 transition-all duration-300 ${
            darkMode ? "bg-[#7A1F1F] text-white" : "bg-white text-[#1E1E1E]"
          }`}
        >
          <h2 className="text-center text-[1.8rem] font-bold font-inter">
            DAFTAR SEBAGAI
          </h2>

          {/* USER BUTTON */}
          <button
            onClick={() => setSelectedRole("user")}
            className={`w-full py-3 rounded-md font-semibold font-inter text-white transition-all duration-200 border-2
              ${
                darkMode
                  ? selectedRole === "user"
                    ? "bg-[#E53935] border-[#E53935]"
                    : "bg-[#5A1414] border-transparent text-white/70 hover:bg-[#6d1818]"
                  : selectedRole === "user"
                    ? "bg-[#0D0D0D] border-[#0D0D0D]"
                    : "bg-[#333] border-transparent text-white/70 hover:bg-[#1a1a1a]"
              }
            `}
          >
            User
          </button>

          {/* SELLER BUTTON */}
          <button
            onClick={() => setSelectedRole("seller")}
            className={`w-full py-3 rounded-md font-semibold font-inter text-white transition-all duration-200 border-2
              ${
                darkMode
                  ? selectedRole === "seller"
                    ? "bg-[#E53935] border-[#E53935]"
                    : "bg-[#5A1414] border-transparent text-white/70 hover:bg-[#6d1818]"
                  : selectedRole === "seller"
                    ? "bg-[#0D0D0D] border-[#0D0D0D]"
                    : "bg-[#333] border-transparent text-white/70 hover:bg-[#1a1a1a]"
              }
            `}
          >
            Seller
          </button>

          {/* DAFTAR BUTTON */}
          <button
            onClick={handleDaftar}
            disabled={!selectedRole}
            className={`w-full py-3 rounded-md font-bold font-inter text-white mt-4 transition-all duration-200 shadow-md
              ${
                !selectedRole
                  ? "bg-gray-500 cursor-not-allowed opacity-50"
                  : darkMode
                    ? "bg-[#E53935] hover:bg-[#b71c1c] hover:scale-[1.02]"
                    : "bg-[#0D0D0D] hover:bg-[#333] hover:scale-[1.02]"
              }
            `}
          >
            LANJUT DAFTAR →
          </button>
          
          <div className="text-center text-sm mt-2 font-inter">
            <a
              href="/login/users"
              className={`font-semibold hover:underline transition-colors duration-200 ${
                 darkMode ? "text-white hover:text-[#e53935]" : "text-[#1E1E1E] hover:text-[#e53935]"
              }`}
            >
              ← Kembali ke Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}