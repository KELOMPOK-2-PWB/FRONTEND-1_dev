"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

// 🔹 UPLOADER CONFIG (SESUIAI SPEC KAMU)
const UPLOAD_BASE = "https://api.danafxc.my.id";
const UPLOAD_ENDPOINT = "/api/proxy/features/upload";
const UPLOAD_APIKEY = "raflitrihanafi";

export default function TambahProdukPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    images: [] as string[],
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    const userRaw = localStorage.getItem("userData");

    if (!t || !userRaw) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userRaw);
    if (user.role !== "seller") {
      router.replace("/");
      return;
    }

    setToken(t);
  }, [router]);

  /* ================= FORM CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= UPLOAD IMAGE (FIXED & SAFE) ================= */
  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Hanya JPG atau PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran maksimal 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      // 🔑 KEY SESUAI SPEC: "ima"
      formData.append("ima", file);

      const res = await fetch(
        `${UPLOAD_BASE}${UPLOAD_ENDPOINT}?apikey=${UPLOAD_APIKEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      // ⚠️ uploader TIDAK selalu JSON → harus aman
      const rawText = await res.text();
      let parsed: any = null;

      try {
        parsed = JSON.parse(rawText);
      } catch {
        // response bukan JSON → normal
        console.warn("Uploader response (non-JSON):", rawText);
      }

      if (!res.ok) {
        alert("Gagal upload gambar");
        return;
      }

      // 🔎 ambil URL dari SEMUA kemungkinan
      const imageUrl =
        parsed?.url ||
        parsed?.data?.url ||
        parsed?.result ||
        (typeof rawText === "string" && rawText.startsWith("http")
          ? rawText
          : null);

      if (!imageUrl) {
        console.error("Uploader response:", rawText);
        alert("URL gambar tidak ditemukan");
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  /* ================= SUBMIT PRODUCT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/products/post-product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": BACKEND_TOKEN || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
          images: form.images, // ✅ dari uploader
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menambahkan produk");
        return;
      }

      alert("Produk berhasil ditambahkan");
      router.push("/dashboardseller");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex bg-[#7A1F1F] text-white">
      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#8B1D1D] p-6 space-y-3">
        <h2 className="font-bold text-lg">A SHOP</h2>

        <button
          onClick={() => router.push("/dashboardseller")}
          className="w-full text-left px-4 py-2 rounded hover:bg-black/40"
        >
          Dashboard
        </button>

        <button className="w-full text-left px-4 py-2 rounded bg-red-600">
          Produk
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="mt-6 bg-black/50 w-full py-2 rounded hover:bg-black"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        <h1 className="text-xl font-bold mb-6">Tambahkan Produk</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#8B1D1D] p-8 rounded space-y-5 max-w-3xl"
        >
          {/* UPLOAD */}
          <label className="block bg-gray-200 h-[180px] rounded flex flex-col items-center justify-center text-gray-700 cursor-pointer">
            <input
              type="file"
              accept=".jpg,.png"
              onChange={handleUploadImage}
              hidden
            />
            {uploading ? "Mengunggah..." : "Klik untuk unggah gambar"}
          </label>

          {/* PREVIEW */}
          {form.images.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {form.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          <input
            name="name"
            placeholder="Nama Produk"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded text-black"
          />

          <textarea
            name="description"
            placeholder="Deskripsi Produk"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded text-black min-h-[100px]"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded text-black"
          >
            <option value="">Pilih Kategori</option>
            <option value="Fashion">Fashion</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Makanan">Makanan</option>
          </select>

          <input
            type="number"
            name="price"
            placeholder="Harga (IDR)"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded text-black"
          />

          <input
            type="number"
            name="quantity"
            placeholder="Total Stok"
            value={form.quantity}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded text-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded font-bold hover:bg-black/80"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </main>
    </div>
  );
}
