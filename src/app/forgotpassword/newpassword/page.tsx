"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function NewPasswordPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // memindahkan pengecekan token ke useeffect agar tidak error di server-side rendering
  useEffect(() => {
    const userEmail = sessionStorage.getItem("resetEmail");
    const resetOtp = sessionStorage.getItem("resetOtp");

    if (!userEmail || !resetOtp) {
      // Kalau data hilang (misal di-refresh paksa), kembalikan ke awal
      alert("Sesi habis. Silakan ulangi proses lupa password.");
      router.push("/forgotpassword");
    }
  }, [router]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      setLoading(false);
      return;
    }

    // ambil data dari sessionStorage
    const email = sessionStorage.getItem("resetEmail"); // Konsisten pakai resetEmail
    const token = sessionStorage.getItem("resetOtp"); // Konsisten pakai resetOtp

    if (!email || !token) {
      setError("Sesi tidak valid. Silakan ulangi proses.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
          token: token, // otp token
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Password berhasil direset! Silakan login.");

        // Bersihkan session storage
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetOtp");

        setTimeout(() => {
          router.push("/login/users");
        }, 2000);
      } else {
        setError(data.message || "Gagal reset password, coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col md:flex-row items-center justify-center transition-colors duration-500 ${
        darkMode ? "bg-[#0D0D0D]" : "bg-white"
      }`}
    >
      {/* LEFT SECTION */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img
          src="/A-logo.png"
          alt="Ashura Logo"
          className="w-[500px] h-[500px] object-contain"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-1 items-center justify-center relative w-full">
        {/* Toggle Dark Mode */}
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

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md rounded-[10px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-4 transition-all duration-300 ${
            darkMode ? "bg-[#7A1F1F] text-white" : "bg-white text-[#1E1E1E]"
          }`}
        >
          <h2 className="text-center text-[1.8rem] font-bold font-inter">
            Reset Password
          </h2>
          <p className="text-center text-base font-medium mb-3 font-inter">
            Masukkan password baru Anda.
          </p>

          <input
            type="password"
            placeholder="Masukkan password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />

          <input
            type="password"
            placeholder="Konfirmasi password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />

          {message && (
            <p
              className={`text-sm text-center font-inter font-semibold ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
          {error && (
            <p
              className={`text-sm text-center font-inter font-semibold ${
                darkMode ? "text-red-300" : "text-red-600"
              }`}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-all duration-200 hover:bg-[#b71c1c] active:scale-[0.98] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memproses..." : "Reset Password"}
          </button>

          <div className="text-center text-sm mt-3 font-inter">
            <a
              href="/forgotpassword"
              className={`hover:underline font-semibold transition-colors ${
                darkMode
                  ? "text-white hover:text-[#e53935]"
                  : "text-[#1E1E1E] hover:text-[#e53935]"
              }`}
            >
              ← Kembali ke halaman lupa password
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
