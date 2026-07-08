// appV1.0 Rev 8 - Sembunyikan tanggal produk masuk & expired dari pelanggan.

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Expand, Glasses, MapPin, MessageCircle, Store } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProductShow({ product, branch }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const images = product.images || [];
    const activeImage = images[activeIndex];
    const whatsappUrl = useMemo(() => {
        if (!branch.whatsapp_phone) return null;

        const message = `Halo ${branch.name}, saya tertarik dengan produk *${product.name}*. Apakah produk ini masih tersedia?`;
        return `https://wa.me/${branch.whatsapp_phone}?text=${encodeURIComponent(message)}`;
    }, [branch.name, branch.whatsapp_phone, product.name]);

    const moveImage = (direction) => {
        if (images.length < 2) return;
        setActiveIndex((index) => (index + direction + images.length) % images.length);
    };

    return (
        <div className="min-h-screen bg-[#f8faf8] pt-[72px] text-[#1d2a2c]">
            <Head title={`${product.name} - Optik Kasih`} />

            <nav className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href={route('home', { branch: branch.id })} className="flex items-center gap-3">
                        <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-10 w-auto" />
                        <span className="text-lg font-black text-[#1f3b3d]">Optik Kasih</span>
                    </Link>
                    <Link href={route('catalog', { branch: branch.id })} className="inline-flex items-center gap-2 text-sm font-bold text-[#e56020] hover:underline"><ArrowLeft className="h-4 w-4" /> Kembali ke katalog</Link>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <Link href={route('home', { branch: branch.id })} className="hover:text-[#e56020]">Beranda</Link>
                    <span>/</span>
                    <Link href={route('catalog', { branch: branch.id })} className="hover:text-[#e56020]">Katalog {branch.name}</Link>
                    <span>/</span>
                    <span className="truncate font-semibold text-slate-700">{product.name}</span>
                </div>

                <section className="grid gap-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:p-7">
                    <div className="min-w-0">
                        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {activeImage ? (
                                <button type="button" onClick={() => setShowLightbox(true)} className="block w-full"><img src={activeImage.url} alt={activeImage.alt} className="aspect-square w-full object-contain" /><span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 transition group-hover:opacity-100"><Expand className="h-5 w-5" /></span></button>
                            ) : (
                                <div className="flex aspect-square flex-col items-center justify-center text-slate-400"><Glasses className="h-16 w-16" /><p className="mt-3 text-sm font-semibold">Foto produk belum tersedia</p></div>
                            )}
                            {images.length > 1 && <><button type="button" onClick={() => moveImage(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white hover:bg-slate-950"><ChevronLeft className="h-6 w-6" /></button><button type="button" onClick={() => moveImage(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white hover:bg-slate-950"><ChevronRight className="h-6 w-6" /></button></>}
                        </div>
                        {images.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveIndex(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${activeIndex === index ? 'border-[#e56020]' : 'border-transparent'}`}><img src={image.url} alt={image.alt} className="h-full w-full object-cover" /></button>)}</div>}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#e56020]">{product.category}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{product.stock > 0 ? 'Tersedia' : 'Stok habis'}</span></div>
                        <h1 className="mt-4 text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl">{product.name}</h1>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{product.description || 'Informasi detail produk dapat ditanyakan langsung kepada admin cabang melalui WhatsApp.'}</p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ketersediaan</p><p className="mt-2 flex items-center gap-2 font-extrabold text-[#1f3b3d]"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> {product.stock} unit</p></div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cabang</p><p className="mt-2 flex items-center gap-2 text-sm font-extrabold text-[#1f3b3d]"><Store className="h-4 w-4 text-[#e56020]" /> {branch.name}</p></div>
                        </div>

                        <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-5"><p className="text-sm font-bold text-[#1f3b3d]">Tertarik dengan produk ini?</p><p className="mt-1 text-sm leading-6 text-slate-600">Hubungi admin {branch.name}; pesan WhatsApp akan otomatis menyertakan nama produk yang dipilih.</p>{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-extrabold text-white hover:bg-[#1fae55]"><MessageCircle className="h-5 w-5" /> Bicara via WhatsApp Cabang</a> : <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-600">Nomor WhatsApp cabang belum diatur.</p>}</div>
                        {branch.address && <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#e56020]" /> {branch.address}</p>}
                    </div>
                </section>
            </main>

            {showLightbox && activeImage && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setShowLightbox(false)}><div className="relative max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}><img src={activeImage.url} alt={activeImage.alt} className="max-h-[88vh] max-w-full rounded-lg object-contain" />{images.length > 1 && <><button type="button" onClick={() => moveImage(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/70 p-3 text-white"><ChevronLeft /></button><button type="button" onClick={() => moveImage(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/70 p-3 text-white"><ChevronRight /></button></>}</div></div>}
        </div>
    );
}
