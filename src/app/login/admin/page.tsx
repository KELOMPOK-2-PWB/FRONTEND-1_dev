"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function LoginAdminPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({
          emailOrUsername: form.emailOrUsername,
          password: form.password,
        }),
      });

      const data = await res.json();
      console.log("ADMIN LOGIN:", data);

      if (res.ok) {
        const role = data.user?.role?.toLowerCase();

        if (role === "admin") {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(data.user));
          setMessage("Login Admin berhasil! Mengalihkan...");
          setTimeout(() => router.push("/dashboard/admin"), 1000);
        } else {
          // Jika User/Seller coba login disini
          setMessage("Akses Ditolak. Akun ini bukan akun Admin.");
        }
      } else {
        setMessage(data.message || "Login gagal.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col md:flex-row items-center justify-center transition-colors duration-500 ${
        darkMode ? "bg-[#0f172a]" : "bg-gray-100" // Warna background sedikit beda biar kerasa "Admin"
      }`}
    >
      <div className="flex flex-1 items-center justify-center relative w-full p-4">
        
        {/* Toggle Mode */}
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

        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md rounded-[10px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex flex-col gap-6 transition-all duration-300 border-t-4 ${
            darkMode 
              ? "bg-[#1e293b] text-white border-blue-500" 
              : "bg-white text-[#1E1E1E] border-blue-600"
          }`}
        >
          <div className="text-center">
            <h2 className="text-[1.8rem] font-bold font-inter tracking-wide">
              ADMIN PORTAL
            </h2>
            <p className="text-sm opacity-70 mt-1">Silakan login untuk mengelola sistem</p>
          </div>

          <input
            type="text"
            name="emailOrUsername"
            placeholder="Username / Email Admin"
            value={form.emailOrUsername}
            onChange={handleChange}
            required
            className={`px-4 py-3 border rounded-md text-base outline-none font-inter transition-all duration-200 ${
              darkMode
                ? "bg-[#0f172a] border-gray-600 focus:border-blue-500 text-white"
                : "bg-gray-50 border-gray-300 focus:border-blue-600 text-gray-800"
            }`}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={`px-4 py-3 border rounded-md text-base outline-none font-inter transition-all duration-200 ${
              darkMode
                ? "bg-[#0f172a] border-gray-600 focus:border-blue-500 text-white"
                : "bg-gray-50 border-gray-300 focus:border-blue-600 text-gray-800"
            }`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-[1rem] font-bold cursor-pointer transition-all duration-200 transform active:scale-[0.98] ${
               loading 
               ? "bg-gray-500 cursor-not-allowed" 
               : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
            }`}
          >
            {loading ? "Memverifikasi..." : "LOGIN ADMIN"}
          </button>

          {message && (
            <div className={`text-center text-sm p-3 rounded-md ${
              message.includes("berhasil") 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}