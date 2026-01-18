"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function LoginPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // State khusus buat tombol verifikasi ulang
  const [isUnverified, setIsUnverified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Reset status error kalau user ngetik ulang
    if (isUnverified) setIsUnverified(false);
    if (message) setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsUnverified(false);
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
      console.log("LOGIN RESPONSE:", data);

      if (res.ok) {
        const role = data.user?.role?.toLowerCase();

        // 🔹 CEGAT ADMIN
        if (role === "admin") {
          setMessage("Akun Admin terdeteksi. Silakan login di halaman khusus Admin.");
          setLoading(false);
          setTimeout(() => router.push("/login/admin"), 2000);
          return;
        }

        // 🔹 USER & SELLER MASUK SINI
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));
        setMessage("Login berhasil! Mengalihkan...");

        if (role === "seller") {
          router.push("/dashboardseller");
        } else if (role === "user" || role === "users") {
          router.push("/");
        }
      } else {
        // Handle Error Login
        const errorMsg = data.message || "Gagal login.";
        setMessage(errorMsg);
        setLoading(false); // Matikan loading karena gagal

        // Cek kalau errornya gara-gara belum verifikasi
        if (errorMsg.toLowerCase().includes("belum diverifikasi") || errorMsg.toLowerCase().includes("not verified")) {
          setIsUnverified(true);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan pada server.");
      setLoading(false); // Matikan loading jika error koneksi
    }
  };

  const handleVerifikasiUlang = () => {
    sessionStorage.setItem("userEmail", form.emailOrUsername);
    router.push("/register/otp");
  };

  return (
    <div
      className={`flex min-h-screen flex-col md:flex-row items-center justify-center transition-colors duration-500 ${
        darkMode ? "bg-[#0D0D0D]" : "bg-white"
      }`}
    >
      {/* LEFT SECTION (LOGO) */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img
          src="/A-logo.png"
          alt="Ashura Logo"
          className="w-[500px] h-[500px] object-contain"
        />
      </div>

      {/* RIGHT SECTION (FORM) */}
      <div className="flex flex-1 items-center justify-center relative w-full">
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

        {/* Form Login */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md rounded-[10px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-4 transition-all duration-300 ${
            darkMode ? "bg-[#7A1F1F] text-white" : "bg-white text-[#1E1E1E]"
          }`}
        >
          <h2 className="text-center text-[1.8rem] font-bold font-inter">
            Login Ashura
          </h2>
          <p className="text-center text-base font-medium mb-3 font-inter">
            Belum punya akun?{" "}
            <a
              href="/register/pilihrole"
              className="text-[#e53935] font-semibold hover:underline"
            >
              Daftar Sekarang
            </a>
          </p>

          <input
            type="text"
            name="emailOrUsername"
            placeholder="Email atau Username"
            value={form.emailOrUsername}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#DADCE0] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#DADCE0] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />

          <div className="flex items-center justify-between text-sm font-inter mt-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[#e53935]" />
              Ingat saya
            </label>
            <a
              href="/forgotpassword"
              className="text-[#e53935] hover:underline"
            >
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-all duration-200 hover:bg-[#b71c1c] active:scale-[0.98]"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          {/* Pesan Error Biasa */}
          {message && !isUnverified && (
            <p
              className={`text-center text-sm mt-2 ${
                darkMode ? "text-gray-300" : "text-[#1E1E1E]"
              }`}
            >
              {message}
            </p>
          )}

          {/* 🔹 TOMBOL KHUSUS JIKA AKUN BELUM DIVERIFIKASI */}
          {isUnverified && (
            <div className="mt-2 flex flex-col items-center gap-2 bg-black/20 p-3 rounded-md border border-yellow-500/50">
              <p className="text-center text-sm text-yellow-400 font-medium">
                {message}
              </p>
              <button
                type="button"
                onClick={handleVerifikasiUlang}
                className="text-sm bg-yellow-500 text-black font-bold px-4 py-1.5 rounded hover:bg-yellow-400 transition-colors"
              >
                Verifikasi Akun Sekarang →
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
