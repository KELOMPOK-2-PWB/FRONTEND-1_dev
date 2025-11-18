"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function OtpVerificationPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "OTP valid. Silakan reset password.");
        setTimeout(() => {
          router.push("/forgotpassword/newpassword");
        }, 1500);
      } else {
        setError(data.message || "OTP salah atau sudah kadaluarsa.");
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
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img src="/A-logo.png" alt="Ashura Logo" className="w-[500px] h-[500px] object-contain" />
      </div>
      <div className="flex flex-1 items-center justify-center relative w-full">
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
          className={`w-full max-w-md rounded-[10px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-4 transition-all duration-300 ${
            darkMode ? "bg-[#7A1F1F] text-white" : "bg-white text-[#1E1E1E]"
          }`}
        >
          <h2 className="text-center text-[1.8rem] font-bold font-inter">Verifikasi OTP</h2>
          <p className="text-center text-base font-medium mb-3 font-inter">Masukkan kode OTP yang dikirim ke email Anda.</p>
          <input
            type="text"
            placeholder="Masukkan kode OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />
          {message && (
            <p className="text-green-500 text-sm text-center font-inter">{message}</p>
          )}
          {error && (
            <p className="text-[red] text-sm text-center font-inter">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-all duration-200 hover:bg-[#b71c1c] active:scale-[0.98] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memproses..." : "Verifikasi OTP"}
          </button>
          <div className="text-center text-sm mt-3 font-inter">
            <a href="/login/users" className="text-[#e53935] hover:underline font-semibold">←  Kembali ke halaman login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
