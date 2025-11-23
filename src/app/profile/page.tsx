// src/app/profile/page.tsx
"use client";

import React, { useState } from "react";
import Navbar from "../../component/Element/Navbar";

const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL; // endpoint upload gambar, harus balas { message, url }

/* ======================= TABS ======================= */

type TabKey = "alamat" | "profil" | "password";

const TABS: { key: TabKey; label: string }[] = [
  { key: "alamat", label: "Alamat" },
  { key: "profil", label: "Profil" },
  { key: "password", label: "Password" },
];

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profil");

  return (
    <div className="min-h-screen bg-[#4F0F0F] pt-[80px]">
      {/* NAVBAR ATAS */}
      <Navbar />

      {/* CONTENT WRAPPER */}
      <main className="max-w-6xl mx-auto px-5 py-6">
        {/* TAB MENU */}
        <div className="flex gap-2 mb-4">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1 text-sm font-semibold rounded-sm border ${
                  isActive
                    ? "bg-[#FF3B30] border-[#FF3B30] text-white"
                    : "bg-black text-white border-black hover:bg-black/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "alamat" && <AlamatTab />}
        {activeTab === "profil" && <ProfilTab />}
        {activeTab === "password" && <PasswordTab />}
      </main>
    </div>
  );
}

/* =========================================================
   TAB ALAMAT / PASSWORD (placeholder sederhana)
   ========================================================= */

function AlamatTab() {
  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-md text-white px-6 py-4">
      <h2 className="text-lg font-bold mb-2">Alamat</h2>
      <p className="text-sm text-gray-200">
        Di sini nanti kamu bisa menampilkan dan mengatur alamat pengiriman
        pengguna.
      </p>
    </section>
  );
}

function PasswordTab() {
  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-md text-white px-6 py-4">
      <h2 className="text-lg font-bold mb-2">Ubah Password</h2>
      <p className="text-sm text-gray-200">
        Form ubah password bisa ditempatkan di bagian ini.
      </p>
    </section>
  );
}

/* =========================================================
   TAB PROFIL – DESAIN + UPLOAD FOTO KE API
   ========================================================= */

function ProfilTab() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // URL dari API
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview lokal dulu biar kerasa responsif
    const localReader = new FileReader();
    localReader.onload = () => {
      setAvatarPreview(localReader.result as string);
    };
    localReader.readAsDataURL(file);

    if (!UPLOAD_URL) {
      setUploadError(
        "URL upload belum dikonfigurasi (NEXT_PUBLIC_UPLOAD_URL)."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();

      // SESUAIKAN nama field ini dengan backend kamu (contoh: "image")
      formData.append("image", file);

      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal upload gambar");
      }

      // API kamu balas: { "message": "Gambar berhasil di-upload!", "url": "https://..." }
      if (!data.url) {
        throw new Error("URL gambar tidak ditemukan pada respon API.");
      }

      setAvatarUrl(data.url);
      setAvatarPreview(data.url); // pakai URL final dari server
      console.log("Upload sukses, url:", data.url);
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setUploadError(err.message || "Terjadi kesalahan saat upload gambar.");
      } else {
        setUploadError("Terjadi kesalahan saat upload gambar.");
      }
    } finally {
      setUploading(false);
    }
  };

  // contoh data dummy, nanti bisa diganti dari backend
  const profileData = {
    nama: "Pangeran Christiano",
    tglLahir: "Tambah Tanggal Lahir",
    jenisKelamin: "Tambah Jenis Kelamin",
    email: "blablabla@gmail.com",
    noHp: "6288888888888",
  };

  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-md text-white px-6 py-6">
      <div className="grid gap-8 md:grid-cols-[280px,1fr]">
        {/* KOLom KIRI: FOTO + TOMBOL */}
        <div className="flex flex-col items-stretch">
          {/* Kartu foto */}
          <div className="bg-[#7A1616] border border-[#b06262] rounded-md px-4 pt-4 pb-3 flex flex-col items-center">
            {/* Avatar */}
            <div className="w-[180px] h-[180px] bg-[#F5C14B] rounded-md flex items-center justify-center text-6xl mb-3 overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span>😆</span>
              )}
            </div>

            {/* Input file hidden */}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Tombol pilih foto */}
            <button
              type="button"
              onClick={() =>
                document.getElementById("avatar-input")?.click()
              }
              className="w-full mt-1 bg-[#c02c2c] hover:bg-[#d33434] text-white text-xs py-[6px] rounded-md disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? "Mengupload..." : "Pilih Foto"}
            </button>

            {/* Info file */}
            <p className="mt-3 text-[10px] leading-snug text-center text-gray-200">
              Batas file maksimal 10.000.000 bytes (10 Megabytes).
              <br />
              Ekstensi file yang diperbolehkan: .JPG, .JPEG, .PNG
            </p>

            {/* Pesan error upload */}
            {uploadError && (
              <p className="mt-2 text-[10px] text-red-200">{uploadError}</p>
            )}

            {/* URL yang sudah tersimpan (opsional ditampilkan) */}
            {avatarUrl && (
              <p className="mt-2 text-[10px] text-green-200 break-all">
                URL tersimpan:
                <br />
                {avatarUrl}
              </p>
            )}
          </div>

          {/* Garis pemisah vertikal (di mobile jadi horizontal) */}
          <div className="hidden md:block w-px bg-[#b06262] self-center my-4 h-32" />

          {/* Tombol PIN & Password */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className="w-full bg-black flex items-center justify-center gap-2 text-sm py-2 rounded-md hover:bg-black/80"
            >
              <span>🔒</span>
              <span>PIN Ashura</span>
            </button>

            <button
              type="button"
              className="w-full bg-[#4F0F0F] border border-black flex items-center justify-center gap-2 text-sm py-2 rounded-md hover:bg-[#3a0b0b]"
            >
              <span>🔑</span>
              <span>Ubah Password</span>
            </button>
          </div>
        </div>

        {/* KOLom KANAN: DATA PROFIL */}
        <div className="flex flex-col gap-6">
          {/* Biodata diri */}
          <div>
            <h2 className="text-base font-bold mb-4">Ubah Biodata Diri</h2>

            <div className="space-y-3 text-sm">
              <RowLabelValue
                label="Nama"
                value={profileData.nama}
                actionLabel="Ubah"
              />
              <RowLabelValue
                label="Tanggal Lahir"
                value={profileData.tglLahir}
                actionLabel="Ubah"
              />
              <RowLabelValue
                label="Jenis Kelamin"
                value={profileData.jenisKelamin}
                actionLabel="Ubah"
              />
            </div>
          </div>

          {/* Garis pembatas */}
          <div className="border-t border-[#b06262] pt-4">
            <h2 className="text-base font-bold mb-4">Ubah Kontak</h2>

            <div className="space-y-3 text-sm">
              <RowLabelValue
                label="Email"
                value={profileData.email}
                actionLabel="Ubah"
              />
              <RowLabelValue
                label="Nomor HP"
                value={profileData.noHp}
                actionLabel="Ubah"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Komponen kecil untuk baris "Label | Value | Ubah" */

type RowProps = {
  label: string;
  value: string;
  actionLabel?: string;
};

function RowLabelValue({ label, value, actionLabel }: RowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-6 text-sm">
      <div className="w-32 text-gray-200">{label}</div>
      <div className="flex-1 text-white">{value}</div>
      {actionLabel && (
        <button
          type="button"
          className="mt-1 md:mt-0 text-xs text-[#FFD6D6] hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
