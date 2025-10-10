"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:3000"; // base API

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

    // simple validation
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      alert("Mohon isi semua field yang wajib.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Password dan Confirm Password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || "Registrasi gagal. Coba lagi.";
        alert(msg);
        setLoading(false);
        return;
      }

      alert(data?.message || "Registrasi berhasil. Silakan verifikasi OTP.");
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      console.error("register error:", err);
      alert("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Tambahan function resend OTP =====
  const handleResendOtp = async () => {
    if (!form.email) {
      alert("Masukkan email untuk resend OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "re_eiG5Nvt3_8NTE4kHg215YyTmjPgzEnUkH", // langsung pakai key
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Gagal resend OTP. Coba lagi.");
        return;
      }

      alert(data?.message || "OTP berhasil dikirim ulang.");
    } catch (err) {
      console.error("resend OTP error:", err);
      alert("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,0,0,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,0,0,0.10),transparent_30%)] -z-10" />

      <div className="relative z-10 bg-black/70 border border-red-600 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.35)] p-10 w-[380px] text-center">
        <div className="flex flex-col items-center mb-4">
          <Image src="/logo.png" alt="Ashura Logo" width={90} height={90} className="mb-3" />
          <h1 className="text-3xl font-bold text-red-500 tracking-widest">ASHURA</h1>
          <h2 className="text-sm text-red-400 mt-1">Create your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-red-400 text-xs mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-2"
              placeholder="masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-red-400 text-xs mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-2"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-red-400 text-xs mb-1">Phone Number</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-2"
              placeholder="0812xxxx..."
            />
          </div>

          <div>
            <label className="block text-red-400 text-xs mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-2"
              placeholder="Password"
              required
            />
          </div>

          <div>
            <label className="block text-red-400 text-xs mb-1">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-2"
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-red-700/60 text-white cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_18px_rgba(255,0,0,0.45)]"
            }`}
          >
            {loading ? "Registering..." : "REGISTER"}
          </button>

          {/* Tombol Resend OTP */}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading || !form.email}
            className={`mt-2 w-full py-2 rounded-lg font-semibold transition ${
              loading || !form.email
                ? "bg-red-700/60 text-white cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_12px_rgba(255,0,0,0.35)]"
            }`}
          >
            {loading ? "Resending..." : "RESEND OTP"}
          </button>
        </form>

        <p className="text-sm text-red-400 mt-5">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-red-500 font-semibold hover:underline"
            type="button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
