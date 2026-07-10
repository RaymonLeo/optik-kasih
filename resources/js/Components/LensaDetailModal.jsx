import { Link } from '@inertiajs/react';
import { Edit, Glasses, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="text-right font-bold text-slate-900">{value}</span>
        </div>
    );
}

const fmtSignedVal = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(v);
    if (isNaN(n)) return String(v);
    return (n > 0 ? '+' : '') + n.toFixed(2);
};

export default function LensaDetailModal({ lensa, editHref, onDelete, onClose, branchName }) {
    if (!lensa) return null;

    const imageUrl = lensa.gambar_url || (lensa.gambar_lensa ? `/storage/${lensa.gambar_lensa}` : null);
    const spec = lensa.spec || {
        SPH: lensa.sph_lensa,
        CYL: lensa.cyl_lensa,
        AXIS: lensa.axis_lensa,
        ADD: lensa.add_lensa,
        PRISM: lensa.prism_lensa,
        BASE: lensa.base_lensa,
    };

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-extrabold text-slate-900">Detail Lensa</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4 flex gap-4">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={lensa.nama_lensa || 'Lensa'}
                            className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                        />
                    ) : (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
                            <Glasses className="h-8 w-8" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xl font-extrabold text-slate-950">{lensa.nama_lensa || '-'}</p>
                        {branchName && <p className="mt-1 text-sm font-bold text-[#E56020]">{branchName}</p>}
                        {lensa.is_pesanan ? (
                            <span className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                Lensa pesanan{lensa.nama_pesanan ? `: ${lensa.nama_pesanan}` : ''}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Informasi Umum</p>
                    <DetailRow label="Jenis" value={lensa.jenis_lensa} />
                    <DetailRow label="Coating" value={lensa.coating_lensa} />
                    <DetailRow label="Indeks" value={lensa.indeks_lensa} />
                    <DetailRow label="Stok" value={lensa.is_pesanan ? 'Lensa pesanan' : (lensa.stok_lensa ?? 0)} />
                    <DetailRow label="Tanggal Masuk" value={lensa.tanggal_masuk} />
                </div>

                <div className="mt-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Ukuran / Spesifikasi</p>
                    <DetailRow label="SPH" value={fmtSignedVal(spec.SPH)} />
                    <DetailRow label="CYL" value={fmtSignedVal(spec.CYL)} />
                    <DetailRow label="AXIS" value={spec.AXIS} />
                    <DetailRow label="ADD" value={fmtSignedVal(spec.ADD)} />
                    <DetailRow label="PRISM" value={spec.PRISM} />
                    <DetailRow label="BASE" value={spec.BASE} />
                </div>

                {lensa.deskripsi && (
                    <div className="mt-5">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Deskripsi</p>
                        <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{lensa.deskripsi}</p>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <Link href={editHref} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white hover:bg-orange-700">
                        <Edit className="h-4 w-4" /> Edit Lensa
                    </Link>
                    <button onClick={onDelete} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
