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
            className={`w-full py-2 rounded-md font-semibold font-inter text-white transition-all duration-200
              ${
                 darkMode
                ? selectedRole === "user"
                  ? "bg-[#E53935]"
                  : "bg-[#5A1414] text-white opacity-50"
                : selectedRole === "user"
                  ? "bg-[#0D0D0D]" 
                  : "bg-[#333] text-white opacity-50"
              }
            `}
          >
            User
          </button>

          {/* SELLER BUTTON */}
          <button
            onClick={() => setSelectedRole("seller")}
            className={`w-full py-2 rounded-md font-semibold font-inter text-white transition-all duration-200
              ${
                darkMode
                ? selectedRole === "seller"
                  ? "bg-[#E53935]"
                  : "bg-[#5A1414] text-white opacity-50"
                : selectedRole === "seller"
                  ? "bg-[#0D0D0D]" 
                  : "bg-[#333] text-white opacity-50"
              }
            `}
          >
            Seller
          </button>

          {/* DAFTAR BUTTON */}
          <button
            onClick={handleDaftar}
            disabled={!selectedRole}
            className={`w-full py-2 rounded-md font-semibold font-inter text-white transition-all duration-200 
              ${
                darkMode
                  ? !selectedRole
                    ? "bg-[#5A1414] text-white opacity-50 cursor-not-allowed"
                    : "bg-[#5A1414] hover:bg-[#E53935] cursor-pointer"
                  : !selectedRole
                    ? "bg-[#333] text-white opacity-100 cursor-not-allowed"
                    : "bg-[#333] hover:bg-[#0D0D0D] cursor-pointer"
              }
            `}
          >
            DAFTAR
          </button>
        </div>
      </div>
    </div>
  );
}
