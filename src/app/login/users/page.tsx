import React from "react";

export default function LoginUserPage() {
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      {/* LEFT SECTION */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center justify-center h-[50px] w-[650px]">
          <img
            src="/A-logo.png"
            alt="Ashura Logo"
            className="w-[650px] h-[650px] object-contain"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-1 items-center justify-center">
        <form className="bg-white rounded-[10px] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.12)] min-w-[350px] max-w-[400px] w-full flex flex-col gap-4">
          <h2 className="text-center text-[1.7rem] font-bold text-[#1E1E1E] font-inter mb-0">
            Masuk ke Akun Anda
          </h2>
          <p className="text-center text-base font-medium text-[#1E1E1E] mb-3 font-inter">
            Belum punya akun Ashura?{" "}
            <a
              href="/register/users"
              className="text-[#e53935] font-medium hover:underline"
            >
              Daftar
            </a>
          </p>

          <input
            type="email"
            placeholder="Email"
            required
            className="text-[#3C4043] px-3 py-2 border border-[#DADCE0] rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="text-[#3C4043] px-3 py-2 border border-[#DADCE0] rounded-md text-base outline-none font-inter focus:border-[#e53935] transition-colors duration-200"
          />

          <div className="flex items-center justify-between text-sm text-[#3C4043] font-inter">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[#e53935]" />
              Ingat saya
            </label>
            <a
              href="/forgot-password"
              className="text-[#e53935] hover:underline"
            >
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            className="bg-[#e53935] text-white rounded-md py-2 text-[1.1rem] font-bold cursor-pointer mt-2 transition-colors duration-200 hover:bg-[#b71c1c]"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
