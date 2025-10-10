"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.local

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      alert("Mohon isi semua field yang wajib.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Registrasi gagal. Coba lagi.");
        setLoading(false);
        return;
      }

      alert(data?.message || "Registrasi berhasil!");
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF5E6] px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="Ashura Logo" width={80} height={80} className="mb-2" />
          <h1 className="text-3xl font-bold text-red-600">ASHURA</h1>
          <p className="text-gray-700 mt-1 text-sm">Buat akunmu dan mulai berbelanja!</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-black font-medium text-sm mb-1 block">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              required
            />
          </div>

          <div>
            <label className="text-black font-medium text-sm mb-1 block">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              required
            />
          </div>

          <div>
            <label className="text-black font-medium text-sm mb-1 block">No. HP </label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="0812xxxx..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            />
          </div>

          <div>
            <label className="text-black font-medium text-sm mb-1 block">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              required
            />
          </div>

          <div>
            <label className="text-black font-medium text-sm mb-1 block">Konfirmasi Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Konfirmasi Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-red-300 text-white cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white shadow-md"
            }`}
          >
            {loading ? "Mendaftarkan..." : "DAFTAR"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          Sudah punya akun?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-red-600 font-semibold hover:underline"
          >
            Masuk
          </button>
        </p>
      </div>
    </div>
  );
}