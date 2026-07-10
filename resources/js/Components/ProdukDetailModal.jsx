import { Link } from '@inertiajs/react';
import { Edit, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="text-right font-bold text-slate-900">{value}</span>
        </div>
    );
}

export default function ProdukDetailModal({ product, editHref, onDelete, onClose }) {
    const images = useMemo(() => {
        if (!product) return [];
        const list = [];
        if (product.gambar_produk) list.push({ id: 'main', path: product.gambar_produk });
        (product.images || []).forEach((img) => list.push({ id: img.id, path: img.path }));
        return list;
    }, [product]);

    const [activeIdx, setActiveIdx] = useState(0);

    if (!product) return null;

    const active = images[Math.min(activeIdx, images.length - 1)] || null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Detail Produk</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {active ? (
                            <img src={`/storage/${active.path}`} alt={product.nama_produk} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                                Tidak ada gambar
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveIdx(idx)}
                                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                                        idx === activeIdx ? 'border-orange-500' : 'border-slate-200'
                                    }`}
                                >
                                    <img src={`/storage/${img.path}`} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <p className="text-xl font-extrabold text-slate-950">{product.nama_produk}</p>
                    <p className="mt-1 text-sm font-bold text-[#E56020]">{product.kategori_produk || 'Tanpa kategori'}</p>
                    {product.admin?.name && (
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{product.admin.name}</p>
                    )}
                </div>

                {product.deskripsi_produk && (
                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{product.deskripsi_produk}</p>
                )}

                <div className="mt-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Informasi Umum</p>
                    <DetailRow label="Harga" value={`Rp ${money(product.harga_produk)}`} />
                    <DetailRow label="Stok" value={product.jumlah_produk ?? 0} />
                    <DetailRow label="Warna" value={product.warna_produk} />
                    <DetailRow label="Bahan" value={product.bahan_produk} />
                    <DetailRow label="Diameter" value={product.diameter_produk} />
                    <DetailRow label="Minus / Plus" value={product.minus_produk} />
                    <DetailRow label="Tanggal Masuk" value={product.tanggal_masuk} />
                    <DetailRow label="Expired Produk" value={product.expired_produk} />
                </div>

                <div className="mt-6 flex gap-3">
                    <Link href={editHref} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white hover:bg-orange-700">
                        <Edit className="h-4 w-4" /> Edit Produk
                    </Link>
                    <button onClick={onDelete} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}
