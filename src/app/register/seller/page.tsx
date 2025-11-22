"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

export default function RegisterSellerPage() {
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email tidak valid";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username harus diisi";
    } else if (form.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    }

    if (!form.password) {
      newErrors.password = "Password harus diisi";
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Password dan konfirmasi password tidak sama";
    }

    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Nomor handphone harus diisi";
    } else if (!/^\d{10,13}$/.test(form.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Nomor handphone tidak valid (10-13 digit)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register-seller`, {
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
        // 🔹 UPDATE DISINI: Simpan Email DAN Role Seller
        sessionStorage.setItem("userEmail", form.email);
        sessionStorage.setItem("userRole", "seller"); // Set role seller

        alert(data.message || "Registrasi berhasil!");
        router.push("/register/otp");
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
          <h2 className="text-center text-[1.8rem] font-bold font-inter">
            Daftar Sebagai Seller
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
          {/* Inputs */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#DADCE0] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Konfirmasi Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#DADCE0] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
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
            className={`px-3 py-2 border rounded-md text-base outline-none font-inter focus:border-[#DADCE0] transition-colors duration-200 ${
              darkMode
                ? "border-[#DADCE0] bg-[#FFFFFF] text-[#3C4043]"
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