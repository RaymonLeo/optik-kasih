// appV1.0 Rev 7 - Klik card buka drawer detail (Edit/Hapus); hapus outline kuning stok rendah, hover-only lift+outline.

import React, { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";
import LensaDetailModal from "@/Components/LensaDetailModal";
import { Edit, Filter, Trash2, X } from "lucide-react";

const SPEC_FIELDS = ['SPH', 'CYL', 'AXIS', 'ADD', 'PRISM', 'BASE'];

function SpecBadges({ spec }) {
    const filled = SPEC_FIELDS.filter((k) => spec?.[k] != null && spec[k] !== '');
    if (filled.length === 0) {
        return <span className="text-xs italic text-gray-400">Tanpa ukuran spesifik</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {filled.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs">
                    <span className="font-semibold text-gray-500">{k}</span>
                    <span className="text-gray-800">{spec[k]}</span>
                </span>
            ))}
        </div>
    );
}

/* ── Checkbox group (multi-select) ─────────────────────────────────────── */
function CheckboxGroup({ title, options = [], selected = [], onToggle, chipClass, checkClass }) {
    return (
        <div className="min-w-[120px]">
            <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-700">{title}</span>
                {selected.length > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${chipClass}`}>
                        {selected.length}
                    </span>
                )}
            </div>
            <div className="space-y-1.5">
                {options.map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                        <input
                            type="checkbox"
                            className={`h-4 w-4 rounded border-gray-300 ${checkClass}`}
                            checked={selected.includes(opt)}
                            onChange={() => onToggle(opt)}
                        />
                        <span className={selected.includes(opt) ? "font-semibold" : ""}>{opt}</span>
                    </label>
                ))}
                {options.length === 0 && (
                    <span className="text-xs italic text-gray-400">Belum ada data</span>
                )}
            </div>
        </div>
    );
}

const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export default function Index() {
    const { props } = usePage();
    const { rows, query = {}, filterOptions = {}, stockAlerts = [] } = props;
    const userId = props.auth?.user?.id;

    const [selectedLensa, setSelectedLensa] = useState(null);
    const [search,      setSearch]      = useState(query.search  || "");
    const [jenis,       setJenis]       = useState(toArr(query.jenis));
    const [coating,     setCoating]     = useState(toArr(query.coating));
    const [indeks,      setIndeks]      = useState(toArr(query.indeks));
    const [showFilter,  setShowFilter]  = useState(
        toArr(query.jenis).length > 0 || toArr(query.coating).length > 0 || toArr(query.indeks).length > 0
    );

    const totalActive     = jenis.length + coating.length + indeks.length;
    const hasActiveFilter = search || totalActive > 0;

    /* ── Navigate ───────────────────────────────────────────────────────────── */
    const nav = (params) =>
        router.get(route("admin.lensa.index"), params, { preserveState: true, replace: true });

    const toggleJenis = (val) => {
        const next = jenis.includes(val) ? jenis.filter(v => v !== val) : [...jenis, val];
        setJenis(next);
        nav({ search, jenis: next, coating, indeks });
    };
    const toggleCoating = (val) => {
        const next = coating.includes(val) ? coating.filter(v => v !== val) : [...coating, val];
        setCoating(next);
        nav({ search, jenis, coating: next, indeks });
    };
    const toggleIndeks = (val) => {
        const next = indeks.includes(val) ? indeks.filter(v => v !== val) : [...indeks, val];
        setIndeks(next);
        nav({ search, jenis, coating, indeks: next });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        nav({ search, jenis, coating, indeks });
    };

    const clearAll = () => {
        setSearch(""); setJenis([]); setCoating([]); setIndeks([]);
        nav({});
    };

    /* ── Stok rendah banner ─────────────────────────────────────────────────── */
    const alertKey = (id) => `sa_l_${userId}_${id}`;
    const [alertCards, setAlertCards] = useState([]);
    const [showBanner,  setShowBanner]  = useState(false);

    useEffect(() => {
        const pageItems = rows?.data || [];
        pageItems.forEach((card) => {
            if (!card.is_pesanan && card.stok_lensa > 5) {
                try { localStorage.removeItem(alertKey(card.id_lensa)); } catch (_) {}
            }
        });
        const toAlert = (stockAlerts || []).filter((c) => {
            try { return !localStorage.getItem(alertKey(c.id_lensa)); } catch (_) { return false; }
        });
        setAlertCards(toAlert);
        if (toAlert.length > 0) setShowBanner(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const dismissBanner = () => {
        alertCards.forEach((c) => {
            try { localStorage.setItem(alertKey(c.id_lensa), '1'); } catch (_) {}
        });
        setShowBanner(false);
    };

    return (
        <SidebarLayout title="Daftar Lensa" subtitle="Kelola data lensa kacamata di cabang ini.">
            <div className="space-y-4">

                {/* Banner stok rendah */}
                {showBanner && alertCards.length > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
                        <div className="flex-1">
                            <p className="font-semibold text-amber-800">
                                Stok lensa berikut hampir habis atau sudah habis:
                            </p>
                            <ul className="mt-1 space-y-0.5 text-sm text-amber-700">
                                {alertCards.map((c) => (
                                    <li key={c.id_lensa} className="flex items-center gap-1.5">
                                        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                        <b>{c.nama_lensa || '(tanpa nama)'}</b>
                                        {c.jenis_lensa && <span className="text-amber-600">— {c.jenis_lensa}</span>}
                                        {c.coating_lensa && <span className="text-amber-500">({c.coating_lensa})</span>}
                                        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                            c.stok_lensa === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            Stok: {c.stok_lensa}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 text-xs text-amber-600">Segera lakukan restock atau tandai sebagai lensa pesanan.</p>
                        </div>
                        <button type="button" onClick={dismissBanner}
                            className="shrink-0 rounded-lg p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-700">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Filter bar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                    {/* Row 1: search + filter toggle + add button */}
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                        <input
                            className="h-10 min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-orange-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama / jenis / indeks / coating…"
                        />

                        {/* Filter toggle button */}
                        <button
                            type="button"
                            onClick={() => setShowFilter((f) => !f)}
                            className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                                showFilter || totalActive > 0
                                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                            {totalActive > 0 && (
                                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {totalActive}
                                </span>
                            )}
                        </button>

                        <button type="submit"
                            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                            Cari
                        </button>

                        {hasActiveFilter && (
                            <button type="button" onClick={clearAll}
                                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                Reset
                            </button>
                        )}

                        <div className="ml-auto">
                            <Link href={route("admin.lensa.create")}
                                className="inline-flex h-10 items-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600">
                                + Tambah Lensa
                            </Link>
                        </div>
                    </form>

                    {/* Checkbox filter panel */}
                    {showFilter && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <div className="flex flex-wrap gap-8">
                                <CheckboxGroup
                                    title="Jenis Lensa"
                                    options={filterOptions.jenis || []}
                                    selected={jenis}
                                    onToggle={toggleJenis}
                                    chipClass="bg-blue-100 text-blue-700"
                                    checkClass="accent-blue-600"
                                />
                                <CheckboxGroup
                                    title="Coating"
                                    options={filterOptions.coating || []}
                                    selected={coating}
                                    onToggle={toggleCoating}
                                    chipClass="bg-emerald-100 text-emerald-700"
                                    checkClass="accent-emerald-600"
                                />
                                <CheckboxGroup
                                    title="Indeks Lensa"
                                    options={filterOptions.indeks || []}
                                    selected={indeks}
                                    onToggle={toggleIndeks}
                                    chipClass="bg-violet-100 text-violet-700"
                                    checkClass="accent-violet-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Active filter chips */}
                    {hasActiveFilter && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {search && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                                    Cari: {search}
                                    <button type="button" onClick={() => { setSearch(""); nav({ jenis, coating, indeks }); }}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {jenis.map((v) => (
                                <span key={v} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                    {v}
                                    <button type="button" onClick={() => toggleJenis(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {coating.map((v) => (
                                <span key={v} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                    {v}
                                    <button type="button" onClick={() => toggleCoating(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {indeks.map((v) => (
                                <span key={v} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                                    Indeks {v}
                                    <button type="button" onClick={() => toggleIndeks(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid kartu lensa */}
                {rows.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500 shadow-sm">
                        {hasActiveFilter
                            ? "Tidak ada lensa yang cocok dengan filter ini."
                            : "Belum ada data lensa. Klik '+ Tambah Lensa' untuk mulai."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {rows.data.map((card) => {
                            const isHabis   = card.stok_lensa === 0 && !card.is_pesanan;
                            const isLow     = !card.is_pesanan && card.stok_lensa > 0 && card.stok_lensa <= 5;
                            const isPesanan = card.is_pesanan;

                            return (
                                <div key={card.id_lensa}
                                    className={`rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                                        isPesanan ? 'border-blue-200 hover:border-blue-400'
                                        : isHabis ? 'border-red-200 hover:border-red-400'
                                        : 'border-slate-200 hover:border-orange-300'
                                    }`}>

                                <button type="button" onClick={() => setSelectedLensa(card)} className="block w-full text-left">
                                    {/* Header: gambar + info */}
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                                            {card.gambar_url ? (
                                                <img src={card.gambar_url} alt={card.nama_lensa} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">🔍</span>
                                            )}
                                            {isHabis && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                                                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                                                        HABIS
                                                    </span>
                                                </div>
                                            )}
                                            {isPesanan && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-600/70">
                                                    <span className="rounded bg-blue-700 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                                                        PESAN
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="truncate font-semibold text-slate-900">{card.nama_lensa || "—"}</span>
                                                {isPesanan && (
                                                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                                                        Lensa Pesan
                                                    </span>
                                                )}
                                                {isHabis && (
                                                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                                                        Stok Habis
                                                    </span>
                                                )}
                                                {isLow && (
                                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                                                        Stok Rendah
                                                    </span>
                                                )}
                                            </div>
                                            {isPesanan && card.nama_pesanan && (
                                                <div className="mt-0.5 text-xs text-blue-600">
                                                    Pesan dari: <b>{card.nama_pesanan}</b>
                                                </div>
                                            )}
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {card.jenis_lensa && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                                                        {card.jenis_lensa}
                                                    </span>
                                                )}
                                                {card.coating_lensa && (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                                        {card.coating_lensa}
                                                    </span>
                                                )}
                                                {card.indeks_lensa && (
                                                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                                                        Indeks {card.indeks_lensa}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1.5 text-xs text-gray-500">
                                                {isPesanan ? (
                                                    <span className="font-semibold text-blue-600">Menunggu kedatangan stok</span>
                                                ) : isHabis ? (
                                                    <b className="text-red-600">Stok: 0 (Habis)</b>
                                                ) : (
                                                    <>Stok: <b className={isLow ? "text-amber-600" : "text-green-700"}>{card.stok_lensa ?? 0}</b></>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spesifikasi */}
                                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                                        <div className="mb-1 text-xs font-semibold text-gray-500">Ukuran Lensa</div>
                                        <SpecBadges spec={card.spec} />
                                    </div>
                                </button>

                                    {/* Aksi */}
                                    <div className="mt-3 flex justify-end gap-2">
                                        <Link href={route("admin.lensa.edit", card.id_lensa)}
                                            className="rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-800 hover:bg-violet-200">
                                            Edit
                                        </Link>
                                        <button
                                            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-200"
                                            onClick={() => {
                                                if (confirm("Hapus lensa ini?")) {
                                                    router.delete(route("admin.lensa.destroy", card.id_lensa));
                                                }
                                            }}>
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2">
                    {rows.links.map((l, i) => (
                        <Link key={i} href={l.url || "#"}
                            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${l.active ? "bg-orange-500 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                            dangerouslySetInnerHTML={{ __html: l.label }} />
                    ))}
                </div>

            </div>

            {selectedLensa && (
                <LensaDetailModal
                    lensa={selectedLensa}
                    editHref={route('admin.lensa.edit', selectedLensa.id_lensa)}
                    onClose={() => setSelectedLensa(null)}
                    onDelete={() => {
                        if (confirm('Hapus lensa ini?')) {
                            router.delete(route('admin.lensa.destroy', selectedLensa.id_lensa));
                            setSelectedLensa(null);
                        }
                    }}
                />
            )}
        </SidebarLayout>
    );
}
