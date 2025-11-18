"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function RegisterUserPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.type === "password" && e.target.placeholder === "Konfirmasi Password" ? "confirmPassword" : e.target.name || e.target.placeholder.toLowerCase().replace(/\s+/g, "")]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": BACKEND_TOKEN || "",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Simpan email ke sessionStorage untuk digunakan di halaman OTP
        sessionStorage.setItem("userEmail", form.email);

        alert(data.message || "Registrasi berhasil!");
        router.push("/register/otp-user");
      } else {
        alert(data.message || "Gagal melakukan registrasi");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server.");
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md rounded-[10px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-4 transition-all duration-300 ${
            darkMode ? "bg-[#1E1E1E] text-white" : "bg-white text-[#1E1E1E]"
          }`}
        >
          <h2 className="text-center text-[1.8rem] font-bold font-inter">
            Daftar Sekarang
          </h2>
          <p className="text-center text-base font-medium mb-3 font-inter">
            Sudah punya akun Ashura?{" "}
            <a
              href="/login/users"
              className="text-[#e53935] font-semibold hover:underline"
            >
              Masuk
            </a>
          </p>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#555] bg-[#2C2C2C] text-white"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#555] bg-[#2C2C2C] text-white"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#555] bg-[#2C2C2C] text-white"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />
          <input
            type="password"
            placeholder="Konfirmasi Password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#555] bg-[#2C2C2C] text-white"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Nomor Handphone"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200 ${
              darkMode
                ? "border-[#555] bg-[#2C2C2C] text-white"
                : "border-[#DADCE0] text-[#3C4043]"
            }`}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-all duration-200 hover:bg-[#b71c1c] active:scale-[0.98]"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
