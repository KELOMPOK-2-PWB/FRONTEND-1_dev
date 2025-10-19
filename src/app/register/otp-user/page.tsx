"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Ambil email dari sessionStorage saat halaman dibuka
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP berhasil diverifikasi!");
        sessionStorage.removeItem("userEmail"); // hapus setelah sukses
        setTimeout(() => router.push("/login/users"), 1500);
      } else {
        setMessage(data.message || "OTP salah atau kadaluarsa.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] flex-col md:flex-row">
      <div className="hidden md:flex flex-1 items-center justify-center">
        <img
          src="/A-logo.png"
          alt="Ashura Logo"
          className="w-[600px] h-[600px] object-contain"
        />
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="relative w-full max-w-[400px]">
          <img
            src="/A-logo.png"
            alt="Ashura Logo"
            className="absolute inset-0 w-full h-full object-contain opacity-10 blur-md md:hidden"
          />

          <form
            onSubmit={handleSubmit}
            className="relative z-10 bg-white rounded-[10px] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.12)] w-full flex flex-col gap-4"
          >
            <h2 className="text-center text-[1.7rem] font-bold text-[#1E1E1E] font-inter">
              Verifikasi OTP
            </h2>
            <p className="text-center text-base font-medium text-[#1E1E1E] mb-3 font-inter">
              Masukkan kode OTP yang telah dikirim ke email Anda.
            </p>

            {/* Email otomatis terisi */}
            <input
              type="email"
              value={email}
              readOnly
              className="text-[#3C4043] px-3 py-2 border border-[#DADCE0] rounded-md text-base outline-none font-inter text-center bg-gray-100 cursor-not-allowed"
            />

            <input
              type="text"
              maxLength={6}
              placeholder="Masukkan 6 Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="text-[#3C4043] px-3 py-2 border border-[#DADCE0] rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 text-center tracking-widest"
            />

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-colors duration-200 hover:bg-[#b71c1c] ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </button>

            {message && (
              <p className="text-center text-sm text-[#1E1E1E] mt-2">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
