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
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok || !data.url) {
        console.error(data);
        alert("Gagal upload gambar");
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload gagal");
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
      if (new Date(form.dropEnd) <= new Date(form.dropStart)) {
        alert("Tanggal akhir drop harus lebih besar dari tanggal mulai");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.message || "Gagal menambahkan produk");
        return;
      }

      alert("Produk berhasil ditambahkan");
      router.push("/dashboardseller");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

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
          <div>
            <label className="block mb-1 text-sm">Mulai Drop</label>
            <input
              type="datetime-local"
              name="dropStart"
              value={form.dropStart}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Akhir Drop</label>
            <input
              type="datetime-local"
              name="dropEnd"
              value={form.dropEnd}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded text-black"
            />
          </div>

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
