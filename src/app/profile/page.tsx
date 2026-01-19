"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Element/Navbar";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence, Variants } from "framer-motion";
import axios from "axios";

// --- TYPE DEFINITIONS ---
type Point = { x: number; y: number };
type Area = { width: number; height: number; x: number; y: number };

// --- KONFIGURASI API ---
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN;
const UPLOADER_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE;
const UPLOADER_API_KEY = process.env.NEXT_PUBLIC_UPLOAD_APIKEY;

// --- AXIOS INSTANCE ---
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": BACKEND_TOKEN || "",
  },
});

// Helper Auth Token
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ============================================================================
// 1. INTERFACES (LENGKAP)
// ============================================================================

interface Address {
  _id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  addressNotes?: string;
  isDefaultAddress: boolean;
}

interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  address?: Address[];
}

interface AddressPayload {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  addressNotes?: string;
  isDefaultAddress: boolean;
  country?: string;
}

// --- Order & Review Interfaces ---
interface ProductItem {
    _id: string;
    id?: string;
    name: string;
    price: number;
    images: string[];
    dropStatus?: string;
}

interface OrderItem {
    _id: string;
    product: ProductItem;
    quantity: number;
    price: number;
    seller?: string;
}

interface OrderHistory {
    _id: string;
    uniqueCode: string;
    status: string;
    totalPrice: number;
    itemsPrice?: number;
    createdAt: string;
    items: OrderItem[];
    courier?: string;
    trackingNumber?: string;
    resiOrder?: string;
}

// Data untuk Modal Review
interface ReviewData {
    productId: string;
    productName: string;
    productImage: string;
    orderId: string;
}

// Upload Response
interface ExternalUploadResponse {
  status: boolean;
  result: {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  };
  message?: string;
}

// Props Components
interface TabProps {
  showModal: (
    type: "success" | "error" | "confirm",
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  closeModal: () => void;
  onSwitchToPassword?: () => void;
}

interface ModalProps {
  isOpen: boolean;
  type: "success" | "error" | "confirm";
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface RowDataProps {
  label: string;
  value: string | undefined;
  onEdit: () => void;
}

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan yang tidak diketahui";
}

const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

type TabKey = "profil" | "pesanan" | "alamat" | "password";
const TABS: { key: TabKey; label: string }[] = [
  { key: "profil", label: "Profil" },
  { key: "alamat", label: "Alamat" },
  { key: "pesanan", label: "Pesanan" },
  { key: "password", label: "Password" },
];

// ============================================================================
// 3. KOMPONEN UI UTAMA (PARENT)
// ============================================================================

function CustomModal({ isOpen, type, title, message, onConfirm, onCancel }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={type !== "confirm" ? onConfirm : undefined}
      ></div>
      <div className="bg-[#1E1E1E] text-white w-full max-w-sm rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#5c1010] p-6 relative z-10 animate-fadeIn text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            type === "success"
              ? "bg-green-900/50 text-green-400"
              : type === "error"
              ? "bg-red-900/50 text-red-400"
              : "bg-yellow-900/50 text-yellow-400"
          }`}
        >
          <span className="text-2xl font-bold">
            {type === "success" ? "✓" : type === "error" ? "✕" : "?"}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          {type === "confirm" && (
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3f0e0e] font-bold"
            >
              Batal
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-8 py-2 rounded-lg font-bold text-white shadow-lg transition ${
              type === "success"
                ? "bg-green-600 hover:bg-green-700"
                : type === "error"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#E53935] hover:bg-[#d32f2f]"
            }`}
          >
            {type === "confirm" ? "Ya" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("profil");
  
  // State untuk mencegah redirect sebelum token dicek
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showModal = (
    type: "success" | "error" | "confirm",
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setModalConfig({ isOpen: true, type, title, message, onConfirm, onCancel });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    // Cek token saat komponen mount (Client Side)
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login/users"); 
    } else {
      setAuthToken(token); 
      setIsAuthChecked(true); // Token siap, render halaman
    }
  }, [router]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
  };

  const tabVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeInOut" } },
  };

  // Loading Screen sebelum token dicek (Mencegah kick logout saat refresh)
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#4F0F0F] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono text-red-200">Memuat Profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4F0F0F] font-sans text-white pb-20">
      <Navbar isLoggedIn={true} />

      <CustomModal
        {...modalConfig}
        onConfirm={() => {
          modalConfig.onConfirm();
          if (modalConfig.type !== "confirm") closeModal();
        }}
        onCancel={closeModal}
      />

      <main className="max-w-6xl mx-auto px-4 pt-[90px] pb-10">
        <div className="mb-6 flex">
           <div className="bg-black p-1.5 rounded-lg inline-flex flex-wrap items-center gap-1 shadow-2xl border border-[#222]">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-6 py-2.5 text-sm font-bold rounded-md transition-all duration-300 ${
                    isActive
                      ? "bg-[#E53935] text-white shadow-lg"
                      : "bg-transparent text-[#888] hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                    {tab.label}
                </button>
              );
            })}
           </div>
        </div>

        <div className="bg-[#5c1010] border border-[#7a1f1f] rounded-xl p-6 md:p-10 shadow-2xl min-h-[500px] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              {activeTab === "pesanan" && <PesananTab showModal={showModal} />}
              
              {activeTab === "alamat" && (
                <AlamatTab showModal={showModal} closeModal={closeModal} />
              )}
              {activeTab === "profil" && (
                <ProfilTab
                  onSwitchToPassword={() => handleTabChange("password")}
                  showModal={showModal}
                  closeModal={closeModal}
                />
              )}
              {activeTab === "password" && (
                <PasswordTab showModal={showModal} closeModal={closeModal} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// 4. TAB: PESANAN (RIWAYAT + KONFIRMASI + REVIEW MODAL)
// ============================================================================
function PesananTab({ showModal }: { showModal: TabProps["showModal"] }) {
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- STATE MODAL REVIEW ---
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ReviewData | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Helper untuk Status Warna
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'selesai':
        return "bg-green-900/50 text-green-300 border-green-700";
      case 'waiting_verification':
      case 'menunggu_verifikasi':
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
      case 'cancelled':
      case 'batal':
        return "bg-red-900/50 text-red-300 border-red-700";
      case 'sent':
      case 'dikirim':
        return "bg-blue-900/50 text-blue-300 border-blue-700";
      default:
        return "bg-gray-800 text-gray-300 border-gray-600";
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/orders/myOrder");
      const data = response.data;
      
      if (data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- ACTION: TERIMA BARANG ---
  const handleConfirmClick = (orderId: string) => {
    showModal(
      "confirm",
      "Terima Barang?",
      "Pastikan barang sudah Anda terima dengan kondisi baik. Tindakan ini akan menyelesaikan pesanan.",
      () => processCompleteOrder(orderId)
    );
  };

  const processCompleteOrder = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      const response = await api.put(`/api/orders/${orderId}/complete`);
      
      if (response.status >= 200 && response.status < 300) {
        showModal(
            "success", 
            "Pesanan Selesai", 
            response.data?.message || "Terima kasih! Pesanan telah diselesaikan.", 
            () => {}
        );
        fetchOrders(); 
      }
    } catch (err) {
      showModal("error", "Gagal", getErrorMessage(err), () => {});
    } finally {
      setProcessingId(null);
    }
  };

  // --- ACTION: BUKA MODAL REVIEW ---
  const openReviewModal = (productData: ReviewData) => {
    setSelectedProduct(productData);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  // --- ACTION: SUBMIT REVIEW ---
  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    setSubmittingReview(true);

    try {
        // API POST REVIEW
        await api.post(`/api/reviews/${selectedProduct.productId}`, {
            rating: Number(rating),
            comment: comment
        });

        setReviewModalOpen(false); // Tutup modal
        showModal("success", "Terima Kasih!", "Ulasan Anda telah berhasil dikirim.", () => {});
    } catch (e) {
        showModal("error", "Gagal", getErrorMessage(e), () => {});
    } finally {
        setSubmittingReview(false);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b border-[#7a1f1f] pb-4 flex items-center gap-2 text-red-100">
          Riwayat Pesanan
        </h2>
        <div className="w-full overflow-x-auto bg-[#2a0505] rounded-lg border border-[#3f0e0e]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#3f0e0e] text-red-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Produk & Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5c1010]">
              {loading && orders.length === 0 ? (
                  <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                          <div className="flex justify-center items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Memuat pesanan...
                          </div>
                      </td>
                  </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const displayTotal = order.totalPrice > 0 
                      ? order.totalPrice 
                      : order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                  const resi = order.trackingNumber || order.resiOrder;
                  const firstItem = order.items[0];
                  const productName = firstItem?.product?.name || "Produk";
                  const productImage = firstItem?.product?.images?.[0] || null;
                  const productId = firstItem?.product?._id || firstItem?.product?.id; 
                  
                  const isSent = order.status.toLowerCase() === "sent";
                  const isCompleted = order.status.toLowerCase() === "completed" || order.status.toLowerCase() === "selesai";

                  // Data untuk modal review
                  const reviewData: ReviewData = {
                      productId: productId || "",
                      productName: productName,
                      productImage: productImage || "",
                      orderId: order._id
                  };

                  return (
                      <tr key={order._id} className="hover:bg-[#4a1212] transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  {productImage && (
                                      <div className="w-12 h-12 bg-black rounded-md overflow-hidden border border-[#5c1010] flex-shrink-0">
                                          <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                                      </div>
                                  )}
                                  <div>
                                      <div className="font-bold text-white text-sm">
                                          {productName} 
                                      </div>
                                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                          {order.uniqueCode}
                                      </div>
                                      {resi && (
                                          <div className="text-[10px] text-gray-300 mt-1 flex gap-2">
                                              {order.courier && <span className="bg-[#3f0e0e] px-1 rounded">{order.courier}</span>}
                                              <span className="font-mono text-yellow-500/80">Resi: {resi}</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex flex-col items-start gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusBadge(order.status)}`}>
                                  {order.status.replace(/_/g, " ")}
                                  </span>
                                  
                                  {/* Tombol Terima Barang */}
                                  {isSent && (
                                      <button 
                                          onClick={() => handleConfirmClick(order._id)}
                                          disabled={processingId === order._id}
                                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg flex items-center gap-1 transition-all"
                                      >
                                          {processingId === order._id ? (
                                              <>
                                                  <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                  Proses...
                                              </>
                                          ) : (
                                              "Diterima?"
                                          )}
                                      </button>
                                  )}

                                  {/* Tombol Review (Muncul Modal) */}
                                  {isCompleted && productId && (
                                      <button 
                                          onClick={() => openReviewModal(reviewData)}
                                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg flex items-center gap-1 transition-all"
                                      >
                                          ★ Beri Ulasan
                                      </button>
                                  )}
                              </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-[#E53935]">
                              {formatRupiah(displayTotal)}
                          </td>
                      </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                    Belum ada riwayat pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 MODAL REVIEW (POPUP) 🔥 */}
      {reviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}></div>
            
            <div className="bg-[#1E1E1E] w-full max-w-md rounded-xl border border-[#5c1010] p-6 relative z-10 animate-fadeIn shadow-2xl">
                <button 
                    onClick={() => setReviewModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >✕</button>
                
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">Beri Ulasan</h3>
                    <p className="text-xs text-gray-400">untuk {selectedProduct.productName}</p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star} 
                            onClick={() => setRating(star)} 
                            className={`text-3xl transition transform hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <textarea 
                        rows={3} 
                        className="w-full bg-[#2a0505] border border-[#5c1010] rounded-lg p-3 text-white focus:border-[#E53935] outline-none placeholder-gray-500"
                        placeholder="Tulis pendapat Anda tentang produk ini..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <button 
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="w-full bg-[#E53935] hover:bg-[#d32f2f] text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {submittingReview && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
            </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// 5. TAB: ALAMAT (FULL CODE RESTORED)
// ============================================================================
function AlamatTab({ showModal, closeModal }: TabProps) {
  const [alamatList, setAlamatList] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formAddr, setFormAddr] = useState<AddressPayload>({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    addressNotes: "",
    isDefaultAddress: false,
    country: "Indonesia",
  });

  const fetchAlamat = async () => {
    try {
      const response = await api.get("/api/users/address");
      const data = response.data;

      if (data) {
        let list: Address[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if ((data as any).data && Array.isArray((data as any).data)) {
          list = (data as any).data;
        }
        setAlamatList(list);
      }
    } catch (err) {
      console.error("Gagal load alamat", err);
    }
  };

  useEffect(() => {
    fetchAlamat();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const url = editMode ? `/api/users/address/${editMode}` : "/api/users/address";
      const method = editMode ? "put" : "post";

      const payload: AddressPayload = {
        street: formAddr.street,
        city: formAddr.city,
        province: formAddr.province,
        postalCode: formAddr.postalCode,
        addressNotes: formAddr.addressNotes,
        isDefaultAddress: formAddr.isDefaultAddress,
        country: formAddr.country || "Indonesia",
      };

      const response = await (api as any)[method](url, payload);

      if (response.status >= 200 && response.status < 300) {
        showModal(
          "success",
          "Berhasil",
          editMode ? "Alamat diperbarui" : "Alamat ditambahkan",
          () => {}
        );
        setShowForm(false);
        setEditMode(null);
        resetForm();
        fetchAlamat();
      }
    } catch (err) {
      showModal("error", "Error", getErrorMessage(err), () => {});
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormAddr({
      street: "",
      city: "",
      province: "",
      postalCode: "",
      addressNotes: "",
      isDefaultAddress: false,
      country: "Indonesia",
    });
  };

  const handleDeleteClick = (id: string) => {
    showModal(
      "confirm",
      "Hapus Alamat?",
      "Apakah Anda yakin?",
      () => {
        handleDeleteConfirm(id);
        closeModal();
      }
    );
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const response = await api.delete(`/api/users/address/${id}`);
      if (response.status >= 200 && response.status < 300) {
        fetchAlamat();
        showModal("success", "Berhasil", "Alamat dihapus!", () => {});
      }
    } catch (err) {
       showModal("error", "Gagal", getErrorMessage(err), () => {});
    }
  };

  const handleEdit = (addr: Address) => {
    setEditMode(addr._id);
    setFormAddr({
      street: addr.street || "",
      city: addr.city || "",
      province: addr.province || "",
      postalCode: addr.postalCode || "",
      addressNotes: addr.addressNotes || "",
      isDefaultAddress: addr.isDefaultAddress || false,
      country: addr.country || "Indonesia",
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-[#7a1f1f] pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-red-100">Daftar Alamat</h2>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditMode(null); resetForm(); }}
            className="bg-[#E53935] hover:bg-[#d32f2f] text-white px-4 py-2 rounded font-bold text-sm shadow transition"
          >
            + Tambah Alamat
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#2a0505] p-6 rounded-lg border border-[#5c1010] mb-8 animate-fadeIn shadow-inner">
          <h3 className="text-lg font-bold mb-4 text-white">{editMode ? "Edit Alamat" : "Tambah Alamat Baru"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block font-bold">Alamat Lengkap (Jalan)</label>
              <textarea rows={2} value={formAddr.street} onChange={(e) => setFormAddr({ ...formAddr, street: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] rounded p-3 text-sm text-white focus:border-[#E53935] outline-none" placeholder="Jl. Raya Bogor KM 20" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-bold">Kota</label>
              <input type="text" value={formAddr.city} onChange={(e) => setFormAddr({ ...formAddr, city: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] rounded p-3 text-sm text-white focus:border-[#E53935] outline-none" placeholder="Jakarta Timur" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-bold">Provinsi</label>
              <input type="text" value={formAddr.province} onChange={(e) => setFormAddr({ ...formAddr, province: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] rounded p-3 text-sm text-white focus:border-[#E53935] outline-none" placeholder="DKI Jakarta" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-bold">Kode Pos</label>
              <input type="text" value={formAddr.postalCode} onChange={(e) => setFormAddr({ ...formAddr, postalCode: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] rounded p-3 text-sm text-white focus:border-[#E53935] outline-none" placeholder="13510" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-bold">Catatan</label>
              <input type="text" value={formAddr.addressNotes || ""} onChange={(e) => setFormAddr({ ...formAddr, addressNotes: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] rounded p-3 text-sm text-white focus:border-[#E53935] outline-none" placeholder="Maju dikit depan gang" />
            </div>
            <div className="col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="defaultAddr" checked={formAddr.isDefaultAddress} onChange={(e) => setFormAddr({ ...formAddr, isDefaultAddress: e.target.checked })} className="accent-[#E53935] w-4 h-4" />
              <label htmlFor="defaultAddr" className="text-sm text-gray-300 cursor-pointer">Jadikan Alamat Utama</label>
            </div>
            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded border border-gray-600 text-gray-300 hover:bg-[#3f0e0e]">Batal</button>
              <button onClick={handleSubmit} disabled={loading} className="bg-[#E53935] hover:bg-[#d32f2f] text-white px-8 py-2 rounded font-bold shadow-lg">{loading ? "Menyimpan..." : "Simpan Alamat"}</button>
            </div>
          </div>
        </div>
      )}

      {alamatList.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-[#3f0e0e]/30 rounded-lg border border-dashed border-[#5c1010]">
          <p className="text-gray-400">Belum ada alamat yang tersimpan.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {alamatList.map((addr) => (
            <div key={addr._id} className={`bg-[#2a0505] border ${addr.isDefaultAddress ? "border-[#E53935] shadow-[0_0_15px_rgba(229,57,53,0.1)]" : "border-[#5c1010]"} rounded-xl p-6 relative flex flex-col justify-between min-h-[180px] hover:bg-[#320606] transition-all`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-[#3f0e0e] text-[10px] font-bold text-red-200 px-3 py-1 rounded uppercase tracking-wider">Alamat</span>
                  {addr.isDefaultAddress && <span className="text-[10px] bg-green-900/60 text-green-300 px-2 py-0.5 rounded border border-green-800">Utama</span>}
                </div>
                <p className="text-sm text-gray-300 mb-1 leading-relaxed">
                  <span className="font-bold text-white block mb-1">{addr.street}</span>
                  {addr.city}, {addr.province}, {addr.postalCode}
                </p>
                {addr.addressNotes && <p className="text-xs text-gray-500 italic mt-1">Note: "{addr.addressNotes}"</p>}
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#3f0e0e]">
                <div className="flex gap-4">
                  <button onClick={() => handleEdit(addr)} className="text-xs font-bold text-gray-400 hover:text-white transition">Ubah</button>
                  <button onClick={() => handleDeleteClick(addr._id)} className="text-xs font-bold text-gray-400 hover:text-red-400 transition">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. TAB: PROFIL (FULL CODE RESTORED)
// ============================================================================
function ProfilTab({ onSwitchToPassword, showModal, closeModal }: TabProps) {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserProfile>({
    id: "",
    name: "",
    username: "",
    phoneNumber: "",
    email: "",
    avatar: "",
  });
  const [formData, setFormData] = useState<UserProfile>({ ...profileData });

  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ email: "", password: "" });

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // --- FETCH PROFILE ---
  const fetchProfile = async () => {
    try {
      const response = await api.get<UserProfile>("/api/users/profile");
      const data = response.data;

      if (data) {
        const user = data;

        let validAvatar = user.avatar;
        if (validAvatar && !validAvatar.startsWith("http") && !validAvatar.startsWith("data:")) {
            validAvatar = ""; 
        }

        const mappedUser: UserProfile = {
          id: user.id || user._id || "",
          name: user.name || "",
          username: user.username || "",
          phoneNumber: user.phoneNumber || "",
          email: user.email || "",
          avatar: validAvatar || "", 
          address: user.address || [],
        };

        setProfileData(mappedUser);
        
        const oldLocalString = localStorage.getItem("userData");
        const oldLocal = oldLocalString ? JSON.parse(oldLocalString) : {};
        localStorage.setItem("userData", JSON.stringify({ ...oldLocal, ...mappedUser }));

        if (validAvatar) {
          setAvatarPreview(validAvatar);
          localStorage.setItem("my_custom_avatar", validAvatar);
        } else {
            setAvatarPreview(null);
        }
      }
    } catch (e: any) {
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            localStorage.removeItem("authToken");
            router.push("/login/users");
            return;
        }
        console.error("Gagal mengambil data profil:", getErrorMessage(e));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openModal = (type: string) => {
    setFormData({ ...profileData });
    setModalType(type);
    setOtpSent(false);
    setOtpCode("");
    setNewEmail("");
    setDeleteForm({ email: "", password: "" });
  };

  const handleUpdateProfile = async () => {
    try {
      const body = {
        name: formData.name,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        avatar: avatarPreview || undefined,
      };

      const response = await api.put<UserProfile>("/api/users/profile", body);

      if (response.status >= 200 && response.status < 300) {
        setProfileData(prev => ({ ...prev, ...body, email: prev.email })); 
        showModal("success", "Berhasil", "Data profil berhasil disimpan!", () => {
           setModalType(null);
        });
      }
    } catch (e) {
      showModal("error", "Error", getErrorMessage(e), () => {});
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteForm.email || !deleteForm.password) {
      showModal("error", "Peringatan", "Isi email dan password konfirmasi.", () => {});
      return;
    }

    try {
      const response = await api.delete<{ message: string }>("/api/users/profile", {
          data: { email: deleteForm.email, password: deleteForm.password }
      });

      if (response.status >= 200 && response.status < 300) {
        showModal(
          "success",
          "Akun Dihapus",
          response.data?.message || "Akun Anda telah berhasil dihapus.",
          () => {
            localStorage.clear();
            router.push("/login/users");
          }
        );
      }
    } catch (e) {
      showModal("error", "Error", getErrorMessage(e), () => {});
    }
  };

  const handleRequestEmail = async () => {
    try {
      const response = await api.post<{ message: string }>("/api/users/request-email-update", { newEmail });

      if (response.status >= 200 && response.status < 300) {
        setOtpSent(true);
        showModal("success", "OTP Terkirim", response.data?.message || "Cek email Anda.", () => {});
      }
    } catch (e) {
      showModal("error", "Error", getErrorMessage(e), () => {});
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await api.post<{ message: string }>("/api/users/verify-email-update", { otp: otpCode });

      if (response.status >= 200 && response.status < 300) {
        showModal("success", "Berhasil", "Email berhasil diubah!", () => {
          window.location.reload();
        });
        setModalType(null);
      }
    } catch (e) {
      showModal("error", "Error", getErrorMessage(e), () => {});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // --- 🔥 UPLOADER EXTERNAL LOGIC ---
  const handleSaveCrop = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;
    setUploading(true);
    
    try {
      const croppedImageBase64 = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedImageBase64) throw new Error("Gagal crop gambar");

      const file = dataURLtoFile(croppedImageBase64, "avatar.jpg");
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      // Gunakan URL dari Env atau Hardcode
      const uploadUrl = new URL(UPLOADER_BASE_URL || "");
      if (UPLOADER_API_KEY) {
        uploadUrl.searchParams.append("apikey", UPLOADER_API_KEY);
      }

      // External Request using axios without interceptors
      const uploadRes = await axios.post<ExternalUploadResponse>(uploadUrl.toString(), formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" }
      });

      const externalData = uploadRes.data;

      // Logic parsing url dari response uploader
      const newUrl = externalData.result?.url || (externalData as any).url;

      if (!newUrl) {
          throw new Error(externalData.message || "Gagal upload gambar.");
      }

      const updateRes = await api.put<UserProfile>("/api/users/profile", { avatar: newUrl });

      if (updateRes.status >= 200 && updateRes.status < 300) {
           setAvatarPreview(newUrl);
          localStorage.setItem("my_custom_avatar", newUrl);
          setShowCropper(false);
          setCropImageSrc(null);
          setTimeout(() => {
            showModal(
              "success",
              "Berhasil",
              "Foto profil berhasil diperbarui!",
              () => {},
            );
          }, 150);
      }
    } catch (e: unknown) {
      showModal("error", "Gagal", getErrorMessage(e), () => {});
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-12 relative">
      <div className="flex flex-col gap-6">
        <div className="bg-[#2a0505] border border-[#5c1010] rounded-xl p-6 flex flex-col items-center shadow-lg">
          <div className="w-40 h-40 rounded-full border-4 border-[#7A1616] bg-[#1a0505] overflow-hidden mb-4 shadow-2xl relative group flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-gray-600 uppercase">
                {profileData.name?.[0] || "?"}
              </span>
            )}
            <div onClick={() => document.getElementById("avatar-input")?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <span className="text-xs font-bold text-white border border-white px-2 py-1 rounded">Ubah Foto</span>
            </div>
          </div>
          <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button onClick={() => document.getElementById("avatar-input")?.click()} disabled={uploading} className="text-sm text-red-300 hover:text-white underline">{uploading ? "Menyimpan..." : "Pilih Foto"}</button>
        </div>
        <button onClick={onSwitchToPassword} className="bg-[#3f0e0e] hover:bg-[#521212] text-white border border-[#5c1010] py-3 rounded-lg font-bold shadow-lg">Ubah Password</button>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-[#2a0505]/50 p-6 rounded-xl border border-[#3f0e0e]">
          <h3 className="text-lg font-bold mb-6 border-b border-[#5c1010] pb-2 text-[#E53935]">Data User</h3>
          <div className="space-y-6">
            <RowData label="Nama Lengkap" value={profileData.name} onEdit={() => { setFormData(profileData); openModal("nama"); }} />
            <RowData label="Username" value={profileData.username} onEdit={() => { setFormData(profileData); openModal("username"); }} />
            <div className="border-t border-[#3f0e0e] my-4"></div>
            <RowData label="Email" value={profileData.email} onEdit={() => openModal("email")} />
            <RowData label="Nomor HP" value={profileData.phoneNumber} onEdit={() => { setFormData(profileData); openModal("hp"); }} />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-[#3f0e0e]">
          <button onClick={() => openModal("delete_account")} className="text-red-500 text-sm hover:text-red-400 hover:underline font-bold transition-all">Hapus Akun Saya</button>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalType(null)}></div>
          <div className="bg-[#1E1E1E] text-white w-full max-w-md rounded-xl border border-[#5c1010] p-6 relative z-10 animate-fadeIn">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-gray-400">✕</button>
            {modalType === "nama" && (
              <>
                <h4 className="text-xl font-bold mb-4">Ubah Nama</h4>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white mb-4" />
                <button onClick={handleUpdateProfile} className="w-full bg-[#E53935] hover:bg-[#d32f2f] text-white font-bold py-3 rounded-lg">Simpan</button>
              </>
            )}
            {modalType === "username" && (
              <>
                <h4 className="text-xl font-bold mb-4">Ubah Username</h4>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white mb-4" />
                <button onClick={handleUpdateProfile} className="w-full bg-[#E53935] hover:bg-[#d32f2f] text-white font-bold py-3 rounded-lg">Simpan</button>
              </>
            )}
            {modalType === "hp" && (
               <>
                <h4 className="text-xl font-bold mb-4">Ubah Nomor HP</h4>
                <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white mb-4" />
                <button onClick={handleUpdateProfile} className="w-full bg-[#E53935] hover:bg-[#d32f2f] text-white font-bold py-3 rounded-lg">Simpan</button>
              </>
            )}
            {modalType === "email" && (
              <>
                {!otpSent ? (
                  <>
                    <h4 className="text-xl font-bold mb-2">Ganti Email</h4>
                    <p className="text-sm text-gray-400 mb-4">Email baru diperlukan untuk OTP.</p>
                    <input type="email" placeholder="Email Baru" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white mb-4" />
                    <button onClick={handleRequestEmail} className="w-full bg-[#E53935] py-3 rounded-lg font-bold">Kirim OTP</button>
                  </>
                ) : (
                  <>
                    <h4 className="text-xl font-bold mb-2">Verifikasi OTP</h4>
                    <input type="text" placeholder="KODE OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white mb-4 text-center tracking-widest text-lg" />
                    <button onClick={handleVerifyEmail} className="w-full bg-[#E53935] py-3 rounded-lg font-bold">Verifikasi</button>
                  </>
                )}
              </>
            )}
            {modalType === "delete_account" && (
              <>
                <h4 className="text-xl font-bold mb-2 text-red-500">Hapus Akun Permanen?</h4>
                <p className="text-sm text-gray-400 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
                <div className="space-y-3 mb-6">
                  <input type="email" placeholder="Email Konfirmasi" value={deleteForm.email} onChange={(e) => setDeleteForm({ ...deleteForm, email: e.target.value })} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white focus:border-red-500 outline-none" />
                  <input type="password" placeholder="Password Konfirmasi" value={deleteForm.password} onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })} className="w-full bg-[#2A0A0A] border border-[#5c1010] rounded p-3 text-white focus:border-red-500 outline-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModalType(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold text-gray-200">Batal</button>
                  <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">HAPUS AKUN</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCropper && cropImageSrc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
            <div className="bg-[#1E1E1E] w-full max-w-lg rounded-xl overflow-hidden flex flex-col h-[500px] border border-[#5c1010]">
            <div className="relative flex-1 bg-black">
              <Cropper image={cropImageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, b) => setCroppedAreaPixels(b)} onZoomChange={setZoom} cropShape="round" showGrid={false} />
            </div>
            <div className="p-6 flex flex-col gap-4 bg-[#2a0505]">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#E53935]" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowCropper(false); setCropImageSrc(null); }} className="px-4 py-2 text-gray-300 font-bold">Batal</button>
                <button onClick={handleSaveCrop} disabled={uploading} className="px-6 py-2 bg-[#E53935] text-white rounded-lg font-bold">{uploading ? "..." : "Simpan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RowData({ label, value, onEdit }: RowDataProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#3f0e0e] pb-3 group">
      <div className="flex-1">
        <p className="text-gray-500 text-xs mb-1 group-hover:text-red-400 transition-colors">{label}</p>
        <p className="text-white font-medium">{value || "Belum diatur"}</p>
      </div>
      <button onClick={onEdit} className="text-sm text-red-500 font-semibold hover:text-white hover:underline mt-2 sm:mt-0 transition-all">Ubah</button>
    </div>
  );
}

// ============================================================================
// 7. TAB: PASSWORD
// ============================================================================
function PasswordTab({ showModal, closeModal }: { showModal: TabProps["showModal"], closeModal: TabProps["closeModal"] }) {
  const [formPw, setFormPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formPw.newPassword !== formPw.confirmPassword) {
      showModal("error", "Gagal", "Konfirmasi password tidak cocok", () => {});
      return;
    }

    setLoading(true);

    try {
      const response = await api.put<{ message: string }>("/api/users/change-password", {
          currentPassword: formPw.currentPassword,
          newPassword: formPw.newPassword
      });

      if (response.status >= 200 && response.status < 300) {
        showModal("success", "Berhasil", response.data?.message || "Password berhasil diubah!", () => {});
        setFormPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (e) {
      showModal("error", "Error", getErrorMessage(e), () => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-2">Ubah Password</h2>
      <div className="bg-[#2a0505] p-6 rounded-xl border border-[#5c1010]">
        <form onSubmit={handleChangePw} className="flex flex-col gap-5">
            <input type="password" placeholder="Password Lama" value={formPw.currentPassword} onChange={(e) => setFormPw({ ...formPw, currentPassword: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] p-3 rounded-lg text-white" required />
            <input type="password" placeholder="Password Baru" value={formPw.newPassword} onChange={(e) => setFormPw({ ...formPw, newPassword: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] p-3 rounded-lg text-white" required />
            <input type="password" placeholder="Konfirmasi Password" value={formPw.confirmPassword} onChange={(e) => setFormPw({ ...formPw, confirmPassword: e.target.value })} className="w-full bg-[#3f0e0e] border border-[#5c1010] p-3 rounded-lg text-white" required />
            <button disabled={loading} className="mt-2 bg-white hover:bg-gray-200 text-black py-3 rounded-lg font-bold shadow-lg">{loading ? "Menyimpan..." : "Simpan Perubahan"}</button>
        </form>
      </div>
    </div>
  );
}

// --- UTILITY ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number; }): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return canvas.toDataURL("image/jpeg");
}

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};