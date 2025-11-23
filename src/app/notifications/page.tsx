// src/app/notifications/page.tsx
"use client";

import { useState } from "react";
import Navbar from "../../component/Element/Navbar";

type TabKey = "transaksi" | "notifikasi";

const TABS: { key: TabKey; label: string }[] = [
  { key: "transaksi", label: "Daftar Transaksi" },
  { key: "notifikasi", label: "Notifikasi" },
];

// status filter ala Tokopedia
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

// sementara kosong biar keluar empty state
const MOCK_ORDERS: Order[] = [];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("transaksi");

  return (
    <div className="min-h-screen bg-[#4F0F0F] pt-[80px]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-5 py-6">
        {/* TAB MENU ATAS (Daftar Transaksi / Notifikasi) */}
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

        {activeTab === "transaksi" && <TransaksiTab />}
        {activeTab === "notifikasi" && <NotifikasiTab />}
      </main>
    </div>
  );
}

/* ==================== DAFTAR TRANSAKSI (DESAIN SEPERTI SCREENSHOT) ==================== */

function TransaksiTab() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusKey>("semua");
  const [productFilter, setProductFilter] = useState("semua");
  const [dateLabel, setDateLabel] = useState("Pilih Tanggal");

  const filteredOrders = MOCK_ORDERS.filter((o) => {
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "semua" || o.status === status;

    const matchProduct =
      productFilter === "semua" ||
      o.productName.toLowerCase().includes(productFilter.toLowerCase());

    return matchSearch && matchStatus && matchProduct;
  });

  const resetFilter = () => {
    setSearch("");
    setStatus("semua");
    setProductFilter("semua");
    setDateLabel("Pilih Tanggal");
  };

  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-xl text-white">
      {/* HEADER CARD */}
      <div className="px-6 pt-4 pb-3 border-b border-white/20">
        <h1 className="text-lg font-bold mb-3">Daftar Transaksi</h1>

        {/* BAR ATAS: SEARCH + DROPDOWN + TANGGAL + RESET */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
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

          {/* Semua Produk */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="md:w-44 px-3 py-2 rounded-md bg-[#4F0F0F] border border-[#b06262] text-xs outline-none"
          >
            <option value="semua">Semua Produk</option>
            {/* nanti bisa diisi list produk */}
          </select>

          {/* Pilih Tanggal */}
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#4F0F0F] border border-[#b06262] text-xs"
          >
            <span>📅</span>
            <span>{dateLabel}</span>
          </button>

          {/* Reset Filter */}
          <button
            type="button"
            onClick={resetFilter}
            className="text-[11px] text-green-300 underline"
          >
            Reset Filter
          </button>
        </div>

        {/* STATUS CHIPS */}
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

      {/* BODY: EITHER TABLE OR EMPTY STATE */}
      {filteredOrders.length === 0 ? (
        <EmptyOrderState />
      ) : (
        <OrderTable orders={filteredOrders} />
      )}
    </section>
  );
}

function EmptyOrderState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-white">
      <div className="w-24 h-24 rounded-2xl bg-[#4F0F0F] flex items-center justify-center border border-[#b06262]">
        <span className="text-4xl">🧾</span>
      </div>
      <p className="mt-4 text-sm font-semibold">Oops, belum ada transaksi</p>
      <p className="mt-1 text-xs text-gray-200 max-w-xs">
        Kamu belum memiliki riwayat pesanan. Yuk, mulai belanja di Ashura Shop!
      </p>
    </div>
  );
}

function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr className="border-b border-white/20">
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
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-white/10">
              <td className="py-3 px-6">{o.id}</td>
              <td className="py-3 px-6">{o.date}</td>
              <td className="py-3 px-6 capitalize">{o.status}</td>
              <td className="py-3 px-6">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(o.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==================== TAB NOTIFIKASI ==================== */

function NotifikasiTab() {
  return (
    <section className="bg-[#7A1616] border border-[#b06262] rounded-xl text-white px-6 py-4">
      <h2 className="text-lg font-bold mb-3">Notifikasi</h2>

      <div className="bg-[#4F0F0F] border border-[#b06262] rounded-md px-4 py-3 text-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">Belum ada notifikasi baru.</span>
          <button className="text-xs underline">Lihat semua</button>
        </div>
        <p className="text-xs text-gray-200">
          Notifikasi terkait pesanan dan aktivitas akun kamu akan muncul di
          sini.
        </p>
      </div>
    </section>
  );
}
