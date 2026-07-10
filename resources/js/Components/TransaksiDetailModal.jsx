// appV1.0 Rev 0 - Modal detail transaksi read-only untuk superadmin (transaksi global lintas cabang).

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

const BADGE_KATEGORI = {
    kacamata: 'bg-violet-100 text-violet-700',
    produk_lainnya: 'bg-sky-100 text-sky-700',
    resep: 'bg-orange-100 text-orange-700',
};
const BADGE_BAYAR = {
    panjar: 'bg-amber-100 text-amber-800 border border-amber-300',
    lunas: 'bg-green-100 text-green-800 border border-green-300',
};
const BADGE_KACAMATA = {
    belum_selesai: 'bg-blue-100 text-blue-700 border border-blue-300',
    sudah_selesai: 'bg-green-100 text-green-700 border border-green-300',
};
const BADGE_AMBIL = {
    belum_diambil: 'bg-slate-100 text-slate-600 border border-slate-300',
    sudah_diambil: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
};

function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="text-right font-bold text-slate-900">{value}</span>
        </div>
    );
}

export default function TransaksiDetailModal({ trx, onClose }) {
    if (!trx) return null;

    const produkLensa = trx.produk?.nama_produk || trx.lensa?.nama_lensa || trx.lensa_pelanggan || '-';

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Detail Transaksi #{trx.id}</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {trx.kategori_transaksi && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${BADGE_KATEGORI[trx.kategori_transaksi] || 'bg-gray-100 text-gray-600'}`}>
                            {trx.kategori_transaksi}
                        </span>
                    )}
                    {trx.status_pembayaran && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${BADGE_BAYAR[trx.status_pembayaran] || 'bg-gray-100 text-gray-600'}`}>
                            {trx.status_pembayaran === 'lunas' ? 'Lunas' : 'Panjar'}
                        </span>
                    )}
                    {trx.status_kacamata && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${BADGE_KACAMATA[trx.status_kacamata] || 'bg-gray-100 text-gray-600'}`}>
                            {trx.status_kacamata === 'sudah_selesai' ? 'Selesai' : 'Proses'}
                        </span>
                    )}
                    {trx.status_pengambilan && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${BADGE_AMBIL[trx.status_pengambilan] || 'bg-gray-100 text-gray-600'}`}>
                            {trx.status_pengambilan === 'sudah_diambil' ? 'Diambil' : 'Blm Diambil'}
                        </span>
                    )}
                    <span className="ml-auto rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#E56020]">
                        {trx.admin?.name || 'Cabang tidak diketahui'}
                    </span>
                </div>

                <div className="mt-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Data Pasien</p>
                    <DetailRow label="Kode Pasien" value={trx.pasien?.kode_pasien} />
                    <DetailRow label="Nama Pasien" value={trx.pasien?.nama_pasien} />
                    <DetailRow label="No HP" value={trx.pasien?.nohp_pasien} />
                    <DetailRow label="Alamat" value={trx.pasien?.alamat_pasien} />
                </div>

                <div className="mt-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Data Pesanan</p>
                    <DetailRow label="Tanggal Pesan" value={trx.tanggal_pesan} />
                    <DetailRow label="Tanggal Masuk" value={trx.tanggal_masuk} />
                    <DetailRow label="Tanggal Selesai" value={trx.tanggal_selesai} />
                    <DetailRow label="Produk / Lensa" value={produkLensa} />
                    <DetailRow label="Gagang Pelanggan" value={trx.gagang_pelanggan} />
                </div>

                <div className="mt-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Pembayaran</p>
                    <DetailRow label="Harga Total" value={`Rp ${money(trx.harga)}`} />
                    <DetailRow label="Panjar" value={`Rp ${money(trx.panjar)}`} />
                    <DetailRow label="Sisa" value={`Rp ${money(trx.sisa)}`} />
                    <DetailRow
                        label={`Metode Bayar 1${trx.metode_pembayaran_1 ? ` (${trx.metode_pembayaran_1})` : ''}`}
                        value={trx.jumlah_bayar_1 != null ? `Rp ${money(trx.jumlah_bayar_1)}` : null}
                    />
                    <DetailRow
                        label={`Metode Bayar 2${trx.metode_pembayaran_2 ? ` (${trx.metode_pembayaran_2})` : ''}`}
                        value={trx.jumlah_bayar_2 != null ? `Rp ${money(trx.jumlah_bayar_2)}` : null}
                    />
                </div>

                <div className="mt-6">
                    <button onClick={onClose} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
