"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function LoginPageUtama() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      alert("Mohon isi semua field.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert("Login berhasil!");
      setLoading(false);
      // redirect ke dashboard bisa ditambahkan di sini
    }, 1000);
  };

  const goToRegister = () => {
    router.push("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF5E6] px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">ASHURA ECOMMERCE</h1>
          <p className="text-gray-700 mt-1 text-sm">Login untuk mulai berbelanja!</p>
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
            <label className="text-black font-medium text-sm mb-1 block">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
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
            {loading ? "Masuk..." : "MASUK"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          Belum punya akun?{" "}
          <button
            onClick={goToRegister}
            className="text-red-600 font-semibold hover:underline"
          >
            Daftar
          </button>
        </p>
      </div>
    </div>
  );
}