// appV1.0 Rev 4 - Tambah badge HABIS dan banner sekali-tampil (localStorage) untuk stok lensa habis.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";
import { ChevronDown, X } from "lucide-react";

const SPEC_FIELDS = ['SPH', 'CYL', 'AXIS', 'ADD', 'PRISM', 'BASE'];

function SpecBadges({ spec }) {
    const filled = SPEC_FIELDS.filter((k) => spec?.[k] != null && spec[k] !== '');
    if (filled.length === 0) {
        return <span className="text-xs text-gray-400 italic">Tanpa ukuran spesifik</span>;
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

function FilterCombobox({ label, value, onChange, options = [], placeholder = "Semua" }) {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState(value || "");
    const ref = useRef(null);

    const filtered = useMemo(
        () => options.filter((o) => o.toLowerCase().includes(typed.toLowerCase())),
        [options, typed]
    );

    const handleSelect = (opt) => { onChange(opt); setTyped(opt); setOpen(false); };
    const handleClear  = () => { onChange(""); setTyped(""); setOpen(false); };

    return (
        <div ref={ref} className="relative flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{label}</label>
            <div className="flex h-10 min-w-[180px] items-center rounded-lg border border-slate-300 bg-white px-3">
                <input
                    className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder={placeholder}
                    value={typed}
                    onChange={(e) => { setTyped(e.target.value); onChange(""); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                />
                {(value || typed) ? (
                    <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-700">
                        <X className="h-4 w-4" />
                    </button>
                ) : (
                    <button type="button" onClick={() => setOpen((o) => !o)} className="text-slate-400">
                        <ChevronDown className="h-4 w-4" />
                    </button>
                )}
            </div>
            {open && filtered.length > 0 && (
                <div className="absolute left-0 top-full z-30 mt-1 max-h-48 min-w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {filtered.map((opt) => (
                        <button key={opt} type="button"
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-700 ${value === opt ? "bg-orange-50 font-semibold text-orange-700" : "text-slate-700"}`}
                            onClick={() => handleSelect(opt)}>
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Index() {
    const { props } = usePage();
    const { rows, query = {}, filterOptions = {}, stockAlerts = [] } = props;
    const userId = props.auth?.user?.id;

    const [search,  setSearch]  = useState(query.search  || "");
    const [jenis,   setJenis]   = useState(query.jenis   || "");
    const [coating, setCoating] = useState(query.coating || "");

    const hasActiveFilter = search || jenis || coating;

    // ── Stok habis banner: sekali tampil per sesi stok habis ──────────────
    const alertKey = (id) => `sa_l_${userId}_${id}`;

    const [alertCards, setAlertCards] = useState([]);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const allAlerts = stockAlerts || [];
        const pageItems = rows?.data || [];

        // Bersihkan key dismissed untuk lensa yang sudah direstok (halaman ini)
        // Sehingga jika stok habis lagi, banner muncul kembali
        pageItems.forEach((card) => {
            if (card.stok_lensa > 0) {
                try { localStorage.removeItem(alertKey(card.id_lensa)); } catch (_) {}
            }
        });

        const toAlert = allAlerts.filter((c) => {
            try { return !localStorage.getItem(alertKey(c.id_lensa)); }
            catch (_) { return false; }
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

    function apply(e) {
        e.preventDefault();
        router.get(route("admin.lensa.index"), { search, jenis, coating }, { preserveState: true, replace: true });
    }

    function clearAll() {
        setSearch(""); setJenis(""); setCoating("");
        router.get(route("admin.lensa.index"), {}, { preserveState: true, replace: true });
    }

    return (
        <SidebarLayout title="Daftar Lensa" subtitle="Kelola data lensa kacamata di cabang ini.">
            <div className="space-y-4">

                {/* Banner stok habis — sekali tampil */}
                {showBanner && alertCards.length > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
                        <div className="flex-1">
                            <p className="font-semibold text-red-800">
                                Stok lensa berikut telah habis:
                            </p>
                            <ul className="mt-1 space-y-0.5 text-sm text-red-700">
                                {alertCards.map((c) => (
                                    <li key={c.id_lensa} className="flex items-center gap-1.5">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <b>{c.nama_lensa || '(tanpa nama)'}</b>
                                        {c.jenis_lensa && <span className="text-red-500">— {c.jenis_lensa}</span>}
                                        {c.coating_lensa && <span className="text-red-400">({c.coating_lensa})</span>}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 text-xs text-red-500">Segera lakukan restock atau perbarui stok lensa ini.</p>
                        </div>
                        <button type="button" onClick={dismissBanner}
                            className="shrink-0 rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-700 transition">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Filter bar */}
                <form onSubmit={apply} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500">Cari</label>
                            <input
                                className="h-10 min-w-[220px] rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-orange-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nama / jenis / indeks / coating…"
                            />
                        </div>

                        <FilterCombobox label="Jenis Lensa" value={jenis} onChange={setJenis}
                            options={filterOptions.jenis || []} placeholder="Semua jenis" />

                        <FilterCombobox label="Coating" value={coating} onChange={setCoating}
                            options={filterOptions.coating || []} placeholder="Semua coating" />

                        <button className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800" type="submit">
                            Terapkan
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
                    </div>

                    {hasActiveFilter && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {search && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                                    Cari: {search}
                                    <button type="button" onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            {jenis && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                    Jenis: {jenis}
                                    <button type="button" onClick={() => setJenis("")}><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            {coating && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                    Coating: {coating}
                                    <button type="button" onClick={() => setCoating("")}><X className="h-3 w-3" /></button>
                                </span>
                            )}
                        </div>
                    )}
                </form>

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
                            const isHabis = card.stok_lensa === 0;
                            return (
                                <div key={card.id_lensa}
                                    className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                                        isHabis ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-orange-200'
                                    }`}>

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
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate font-semibold text-slate-900">{card.nama_lensa || "—"}</span>
                                                {isHabis && (
                                                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                                                        Stok Habis
                                                    </span>
                                                )}
                                            </div>
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
                                            </div>
                                            <div className="mt-1.5 text-xs text-gray-500">
                                                {card.indeks_lensa && <>Indeks <b>{card.indeks_lensa}</b> &nbsp;•&nbsp;</>}
                                                {isHabis ? (
                                                    <b className="text-red-600">Stok: 0 (Habis)</b>
                                                ) : (
                                                    <>Stok: <b className="text-green-700">{card.stok_lensa ?? 0}</b></>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spesifikasi */}
                                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                                        <div className="mb-1 text-xs font-semibold text-gray-500">Ukuran Lensa</div>
                                        <SpecBadges spec={card.spec} />
                                    </div>

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
        </SidebarLayout>
    );
}
