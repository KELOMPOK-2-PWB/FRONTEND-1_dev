"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function ForgotPasswordOtpPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true); // Default Dark Mode
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil email dari sessionStorage 
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (storedEmail) setEmail(storedEmail);
    else {
      // Jika tidak ada email, kembalikan ke halaman input email
      router.push("/forgotpassword");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-reset-otp-password`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP Valid! Silakan buat password baru.");
        
        const tokenFromServer = data.token || data.resetToken || data.data?.token || otp;
        
        // Simpan token dari server ke session
        sessionStorage.setItem("resetOtp", tokenFromServer); 
        // --------------------------------------------------

        // Redirect ke halaman New Password
        setTimeout(() => router.push("/forgotpassword/newpassword"), 1500);
      } else {
        setError(data.message || "Kode OTP salah atau kadaluarsa.");
      }
      
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server.");
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
        
        {/* Toggle Mode Button */}
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
          <h2 className="text-center text-[1.7rem] font-bold font-inter">
            Verifikasi Reset
          </h2>
          <p className="text-center text-base font-medium mb-3 font-inter">
            Masukkan kode OTP reset password yang dikirim ke email Anda.
          </p>

          {/* Email Readonly */}
          <input
            type="email"
            value={email}
            readOnly
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter text-center cursor-not-allowed ${
              darkMode
                ? "bg-[#5A1414] border-[#5A1414] text-white/70"
                : "bg-gray-100 border-[#DADCE0] text-[#3C4043]"
            }`}
          />

          <input
            type="text"
            maxLength={6}
            placeholder="Masukkan 6 Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter text-center tracking-widest transition-colors duration-200 focus:border-[#e53935] ${
              darkMode
                ? "bg-white text-[#3C4043] border-transparent"
                : "bg-white text-[#3C4043] border-[#DADCE0]"
            }`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-colors duration-200 hover:bg-[#b71c1c] active:scale-[0.98] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memproses..." : "Verifikasi"}
          </button>

          {message && (
            <p className={`text-center text-sm mt-2 font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
              {message}
            </p>
          )}
          {error && (
            <p className={`text-center text-sm mt-2 font-semibold ${darkMode ? "text-red-300" : "text-red-600"}`}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}