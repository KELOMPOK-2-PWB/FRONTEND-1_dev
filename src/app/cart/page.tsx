"use client";

import { useState } from "react";
import Navbar from "../../component/Element/Navbar";

// TAB
type TabKey = "pesanan";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pesanan", label: "Pesanan" },
];

// STATUS FILTER
type StatusKey =
  | "semua"
  | "berlangsung"
  | "berhasil"
  | "tidak_berhasil"
  | "menunggu_konfirmasi"
  | "diproses"
  | "dikirim"
  | "tiba_di_tujuan"
  | "dikomplain";

const STATUS_FILTERS: { key: StatusKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "berlangsung", label: "Berlangsung" },
  { key: "berhasil", label: "Berhasil" },
  { key: "tidak_berhasil", label: "Tidak Berhasil" },
  { key: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { key: "diproses", label: "Diproses" },
  { key: "dikirim", label: "Dikirim" },
  { key: "tiba_di_tujuan", label: "Tiba di Tujuan" },
  { key: "dikomplain", label: "Dikomplain" },
];

type Order = {
  id: string;
  date: string;
  status: StatusKey;
  productName: string;
  total: number;
};

const MOCK_ORDERS: Order[] = []; // kosong → muncul empty state

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pesanan");

  return (
    <div className="min-h-screen bg-[#4F0F0F] pt-[80px]">
      <Navbar />

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

        {/* CONTENT */}
        {activeTab === "pesanan" && <PesananTab />}
      </main>
    </div>
  );
}

/* ================= PESANAN TAB =============== */
function PesananTab() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusKey>("semua");

  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-xl text-white">
      {/* HEADER */}
      <div className="px-6 pt-4 pb-3 border-b border-[#b06262]">
        <h1 className="text-lg font-bold mb-3">Riwayat Pesanan</h1>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* SEARCH */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari transaksi di sini"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md bg-[#4F0F0F] border border-[#b06262] text-xs outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* STATUS FILTER */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold mr-1">Status</span>
          {STATUS_FILTERS.map((s) => {
            const active = s.key === status;
            return (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  active
                    ? "bg-[#2ECC71] text-black border-[#2ECC71]"
                    : "bg-[#4F0F0F] text-white border-[#b06262] hover:bg-[#6d2222]"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <EmptyOrderState />
    </section>
  );
}

/* ============ EMPTY STATE (MATCH DESIGN) ============ */
function EmptyOrderState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-xl bg-[#4F0F0F] flex items-center justify-center border border-[#b06262]">
        <span className="text-4xl">🧾</span>
      </div>

      <p className="mt-4 text-sm font-semibold">Oops, belum ada transaksi</p>

      <p className="mt-1 text-xs text-gray-300 max-w-xs">
        Kamu belum memiliki riwayat pesanan. Yuk, mulai belanja di Ashura Shop!
      </p>
    </div>
  );
}
