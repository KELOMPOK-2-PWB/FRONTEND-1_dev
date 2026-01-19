"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;

const UPLOADER_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE;
const UPLOADER_API_KEY = process.env.NEXT_PUBLIC_UPLOAD_APIKEY;

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
    dropStart: "",
    dropEnd: "",
  });

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.append("image", file);

      const res = await fetch(
        `${UPLOADER_BASE_URL}?apikey=${UPLOADER_API_KEY}`,
        { method: "POST", body: formData },
      );

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert("Gagal upload gambar");
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (form.images.length === 0) {
      alert("Minimal 1 gambar produk");
      return;
    }

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
          discount: 0,
          images: form.images,
          dropStart: new Date(form.dropStart).toISOString(),
          dropEnd: new Date(form.dropEnd).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Gagal menambahkan produk");
        return;
      }

      alert("Produk berhasil ditambahkan");
      router.push("/dashboardseller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#4F0F0F] via-[#6A1414] to-[#4F0F0F] text-white">

      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#2a0505] border-r border-[#5c1010] p-6 shadow-xl">
        <h2 className="text-xl font-extrabold text-[#E53935] tracking-wide mb-6">
          A SHOP
        </h2>

        <button
          onClick={() => router.push("/dashboardseller")}
          className="w-full text-left px-4 py-2 rounded-lg font-bold hover:bg-[#3f0e0e]"
        >
          Dashboard
        </button>

        <button className="w-full text-left px-4 py-2 mt-2 rounded-lg font-bold bg-[#E53935] shadow">
          Produk
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="mt-8 w-full py-2 rounded-lg bg-black/60 hover:bg-black font-bold"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">
          Tambahkan Produk
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#2a0505] border border-[#5c1010] p-8 rounded-xl shadow-lg space-y-5 max-w-3xl"
        >
          {/* UPLOAD */}
          <label className="block h-[180px] rounded-xl border-2 border-dashed border-[#E53935] flex items-center justify-center cursor-pointer hover:bg-[#3f0e0e] transition">
            <input
              type="file"
              accept=".jpg,.png"
              onChange={handleUploadImage}
              hidden
            />
            <span className="text-sm opacity-80">
              {uploading ? "Mengunggah..." : "Klik untuk upload gambar"}
            </span>
          </label>

          {/* PREVIEW */}
          {form.images.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {form.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-24 h-24 object-cover rounded-lg border border-[#5c1010]"
                />
              ))}
            </div>
          )}

          <input
            name="name"
            placeholder="Nama Produk"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#3f0e0e] border border-[#5c1010] outline-none focus:border-[#E53935]"
          />

          <textarea
            name="description"
            placeholder="Deskripsi Produk"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#3f0e0e] border border-[#5c1010] outline-none focus:border-[#E53935] min-h-[100px]"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 rounded bg-[#3f0e0e] border border-[#5c1010]"
          >
            <option value="">Pilih Kategori</option>
            <option value="Fashion">Fashion</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Makanan">Makanan</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              placeholder="Harga"
              value={form.price}
              onChange={handleChange}
              className="p-2 rounded bg-[#3f0e0e] border border-[#5c1010]"
            />

            <input
              type="number"
              name="quantity"
              placeholder="Stok"
              value={form.quantity}
              onChange={handleChange}
              className="p-2 rounded bg-[#3f0e0e] border border-[#5c1010]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              name="dropStart"
              value={form.dropStart}
              onChange={handleChange}
              className="p-2 rounded bg-[#3f0e0e] border border-[#5c1010]"
            />

            <input
              type="datetime-local"
              name="dropEnd"
              value={form.dropEnd}
              onChange={handleChange}
              className="p-2 rounded bg-[#3f0e0e] border border-[#5c1010]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E53935] hover:bg-[#d32f2f] py-2 rounded-lg font-bold shadow"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </main>
    </div>
  );
}
