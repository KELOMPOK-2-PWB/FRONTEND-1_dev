export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D0D0D] text-white px-6 text-center">
      {/* Big 404 Text */}
      <h1 className="text-[8rem] sm:text-[10rem] font-extrabold text-[#e53935] leading-none select-none">
        404
      </h1>

      {/* Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-semibold mt-4">
        Halaman Tidak Ditemukan
      </h2>
      {/* Back Button */}
      <a
        href="/"
        className="mt-8 inline-block bg-[#e53935] hover:bg-[#b71c1c] text-white font-semibold py-2 px-6 rounded-md transition-all duration-200 shadow-lg"
      >
        Kembali ke Beranda
      </a>

      {/* Decorative Glow */}
      <div className="absolute w-[300px] h-[300px] bg-[#e53935]/20 blur-[120px] rounded-full -z-10"></div>
    </div>
  );
}
