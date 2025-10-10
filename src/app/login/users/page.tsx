"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", form);

    // contoh login
    if (form.username && form.password) {
      alert("Login successful!");
      // di sini bisa diarahkan ke dashboard
    } else {
      alert("Please fill out all fields");
    }
  };

  const goToRegister = () => {
    router.push("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
      {/* Background Partikel Merah */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,0,0,0.25),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(255,0,0,0.2),_transparent_40%)] animate-pulse"></div>

      {/* Card Login */}
      <div className="relative z-10 bg-black/70 border border-red-600 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.4)] p-10 w-[380px] text-center backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Ashura Logo"
            width={100}
            height={100}
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-red-500 tracking-widest">
            ASHURA
          </h1>
          <h2 className="text-lg font-semibold text-red-500 mb-8 tracking-wide">
            LOGIN
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          <div>
            <label className="block text-red-400 text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-1"
              required
            />
          </div>

          <div>
            <label className="block text-red-400 text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-red-600 focus:outline-none focus:border-red-400 text-white py-1"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all"
          >
            LOGIN
          </button>
        </form>

        {/* Link ke Register */}
        <div className="mt-6 text-sm text-red-400">
          <p>Don’t have an account?</p>
          <button
            onClick={goToRegister}
            className="mt-2 px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            REGISTER
          </button>
        </div>
      </div>
    </div>
  );
}
