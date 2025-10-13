import React from "react";

export default function LoginUserPage() {
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

          {/* LOGIN FORM */}
          <form className="relative z-10 bg-white rounded-[10px] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.12)] w-full flex flex-col gap-4">
            <h2 className="text-center text-[1.7rem] font-bold text-[#1E1E1E] font-inter">
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

            <div className="flex items-center justify-between text-sm text-[#3C4043] font-inter flex-wrap gap-2">
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
    </div>
  );
}