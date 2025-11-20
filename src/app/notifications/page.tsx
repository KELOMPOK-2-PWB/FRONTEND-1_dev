// src/app/notifications/page.tsx
"use client";

import { useState } from "react";
import Navbar from "../../component/Element/Navbar";

type TabKey = "pesanan" | "alamat" | "password" | "profil";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pesanan", label: "Pesanan" },
  { key: "alamat", label: "Alamat" },
  { key: "password", label: "Password" },
  { key: "profil", label: "Profil" },
];

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pesanan");

  return (
    <div className="min-h-screen bg-[#4F0F0F] pt-[80px]">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT WRAPPER */}
      <main className="max-w-6xl mx-auto px-5 py-6">
        {/* TAB MENU */}
        <div className="flex gap-2 mb-5">
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
        {activeTab === "pesanan" && <PesananTab />}
        {activeTab === "alamat" && <AlamatTab />}
        {activeTab === "password" && <PasswordTab />}
        {activeTab === "profil" && <ProfilTab />}
      </main>
    </div>
  );
}

/* ===================== PESANAN TAB ===================== */

function PesananTab() {
  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-md text-white">
      <div className="px-6 py-4 border-b border-white/30">
        <h1 className="text-lg font-bold">Riwayat Pesanan</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/30">
              <th className="py-3 px-6 text-left font-semibold">ID Pesanan</th>
              <th className="py-3 px-6 text-left font-semibold">
                Tanggal Pesanan
              </th>
              <th className="py-3 px-6 text-left font-semibold">
                Status Pesanan
              </th>
              <th className="py-3 px-6 text-left font-semibold">
                Harga Pesanan
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="py-6 px-6 text-center text-xs text-gray-200"
              >
                Belum ada riwayat pesanan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ===================== TAB LAIN (PLACEHOLDER) ===================== */

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

function ProfilTab() {
  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-md text-white px-6 py-4">
      <h2 className="text-lg font-bold mb-2">Profil</h2>
      <p className="text-sm text-gray-200">
        Data profil pengguna (nama, email, nomor HP, dll) bisa ditampilkan di
        sini.
      </p>
    </section>
  );
}
