'use client';
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Otp berhasil dikirim ke email anda.");
      } else {
        setError(data.message || "Terjadi kesalahan, silakan coba lagi.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] flex-col md:flex-row">
      {/* LEFT SECTION (Logo - Desktop Only) */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img
          src="/A-logo.png"
          alt="Ashura Logo"
          className="w-[600px] h-[600px] object-contain"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="relative w-full max-w-[400px]">
          {/* LOGO BACKGROUND (Mobile Only) */}
          <img
            src="/A-logo.png"
            alt="Ashura Logo"
            className="absolute inset-0 w-full h-full object-contain opacity-10 blur-md md:hidden"
          />

          {/* FORGOT PASSWORD FORM */}
          <form
            onSubmit={handleSubmit}
            className="relative z-10 bg-white rounded-[10px] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.12)] w-full flex flex-col gap-4"
          >
            <h2 className="text-center text-[1.7rem] font-bold text-[#1E1E1E] font-inter">
              Lupa Password
            </h2>
            <p className="text-center text-base font-medium text-[#1E1E1E] mb-3 font-inter">
              Masukkan email Anda untuk menerima OTP reset password.
            </p>

            <input
              type="email"
              placeholder="Alamat Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-[#3C4043] px-3 py-2 border border-[#DADCE0] rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200"
            />

            {/* Pesan sukses atau error */}
            {message && (
              <p className="text-green-600 text-sm text-center font-medium font-inter">
                {message}
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm text-center font-medium font-inter">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-colors duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#b71c1c]"
              }`}
            >
              {loading ? "Mengirim OTP..." : "Kirim OTP"}
            </button>

            <div className="text-center text-sm mt-3 font-inter">
              <a href="/login/users" className="text-[#e53935] hover:underline">
                ← Kembali ke halaman login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
