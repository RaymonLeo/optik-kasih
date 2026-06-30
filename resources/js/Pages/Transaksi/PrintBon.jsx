// appV1.0 Rev 2 - Print bon / nota transaksi — aligned with controller prop names.

import React, { useEffect } from "react";
import { usePage } from "@inertiajs/react";

const fmtIDR = (n) => Number(n || 0).toLocaleString("id-ID");

function Row({ label, value }) {
  return (
    <tr>
      <td style={{ width: "38%", paddingRight: "4px", verticalAlign: "top", color: "#555" }}>{label}</td>
      <td style={{ width: "4%", verticalAlign: "top", color: "#555" }}>:</td>
      <td style={{ verticalAlign: "top", color: "#111", fontWeight: "500" }}>{value || "-"}</td>
    </tr>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px dashed #aaa", margin: "10px 0" }} />;
}

export default function PrintBon() {
  const { props } = usePage();
  const { trx, rx, branchName = "Optik Kasih" } = props;

  useEffect(() => {
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, []);

  const isKacamata = trx?.kategori === "kacamata";
  const rxFields   = ["SPH", "CYL", "AXIS", "PRISM", "BASE", "ADD", "PD"];

  const styles = {
    page: { fontFamily: "'Courier New', Courier, monospace", fontSize: "11px", maxWidth: "300px", margin: "0 auto", padding: "12px", background: "#fff" },
    center: { textAlign: "center" },
    bold: { fontWeight: "700" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "10px" },
    th: { border: "1px solid #999", padding: "2px 4px", textAlign: "center" },
    td: { border: "1px solid #999", padding: "2px 4px", textAlign: "center" },
    statusLunas:  { display: "inline-block", padding: "2px 10px", borderRadius: "99px", background: "#d1fae5", color: "#065f46", fontWeight: "700", fontSize: "11px" },
    statusPanjar: { display: "inline-block", padding: "2px 10px", borderRadius: "99px", background: "#fef3c7", color: "#92400e", fontWeight: "700", fontSize: "11px" },
    toolbar: { position: "fixed", top: 0, left: 0, right: 0, background: "#111", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", zIndex: 999 },
    btnBack:  { background: "#444", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "13px" },
    btnPrint: { background: "#e56020", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  };

  return (
    <>
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 4mm; }
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      {/* Toolbar (hidden on print) */}
      <div style={styles.toolbar} className="no-print">
        <span style={{ color: "#fff", fontWeight: "600" }}>Preview Bon #{trx?.id}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={styles.btnBack}  onClick={() => window.history.back()}>← Kembali</button>
          <button style={styles.btnPrint} onClick={() => window.print()}>🖨 Cetak</button>
        </div>
      </div>

      {/* Receipt body */}
      <div style={{ ...styles.page, marginTop: "56px" }} className="print:mt-0">

        {/* Header */}
        <div style={styles.center}>
          <div style={{ fontSize: "15px", fontWeight: "700", letterSpacing: "1px" }}>OPTIK KASIH</div>
          {branchName && branchName !== "Optik Kasih" && (
            <div style={{ fontSize: "10px", color: "#666" }}>{branchName}</div>
          )}
          <div style={{ fontSize: "10px", color: "#777", marginTop: "2px" }}>
            Jl. Contoh Alamat No. 1
          </div>
        </div>

        <Divider />

        {/* Info bon */}
        <table style={{ ...styles.table, fontSize: "11px" }}>
          <tbody>
            <Row label="No Bon"     value={`#${trx?.id}`} />
            <Row label="Tanggal"    value={trx?.tanggal} />
            {trx?.tanggal_selesai && <Row label="Tgl Selesai" value={trx.tanggal_selesai} />}
            <Row label="Kasir"      value={branchName} />
          </tbody>
        </table>

        <Divider />

        {/* Pasien */}
        {trx?.pasien && (
          <>
            <table style={{ ...styles.table, fontSize: "11px" }}>
              <tbody>
                <tr>
                  <td colSpan={3} style={{ fontWeight: "700", paddingBottom: "2px" }}>Data Pasien</td>
                </tr>
                <Row label="Nama"   value={trx.pasien.nama} />
                <Row label="Kode"   value={trx.pasien.kode} />
                {trx.pasien.alamat  && <Row label="Alamat"  value={trx.pasien.alamat} />}
                {trx.pasien.telepon && <Row label="No. HP"  value={trx.pasien.telepon} />}
              </tbody>
            </table>
            <Divider />
          </>
        )}

        {/* RX Resep */}
        {isKacamata && rx && (
          <>
            <div style={{ ...styles.center, fontWeight: "700", letterSpacing: "2px", fontSize: "10px", marginBottom: "4px" }}>RESEP</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>RX</th>
                  {rxFields.map(f => <th key={f} style={styles.th}>{f}</th>)}
                </tr>
              </thead>
              <tbody>
                {["OD", "OS"].map(eye => (
                  <tr key={eye}>
                    <td style={{ ...styles.td, fontWeight: "700" }}>{eye}</td>
                    {rxFields.map(f => (
                      <td key={f} style={styles.td}>{rx[eye]?.[f] ?? "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <Divider />
          </>
        )}

        {/* Frame & Lensa */}
        {isKacamata && (trx?.frame || trx?.lensa) && (
          <>
            <table style={{ ...styles.table, fontSize: "11px" }}>
              <tbody>
                {trx.frame && <Row label="Frame" value={trx.frame} />}
                {trx.lensa && <Row label="Lensa" value={trx.lensa} />}
              </tbody>
            </table>
            <Divider />
          </>
        )}

        {/* Produk lainnya */}
        {!isKacamata && trx?.produk && (
          <>
            <table style={{ ...styles.table, fontSize: "11px" }}>
              <tbody>
                <Row label="Produk" value={trx.produk} />
              </tbody>
            </table>
            <Divider />
          </>
        )}

        {/* Pembayaran */}
        <table style={{ ...styles.table, fontSize: "11px" }}>
          <tbody>
            <tr>
              <td style={{ width: "38%", color: "#555" }}>Jumlah</td>
              <td style={{ width: "4%", color: "#555" }}>:</td>
              <td style={{ textAlign: "right", fontWeight: "700" }}>Rp {fmtIDR(trx?.harga)}</td>
            </tr>
            <tr>
              <td style={{ color: "#555" }}>Panjar</td>
              <td style={{ color: "#555" }}>:</td>
              <td style={{ textAlign: "right" }}>Rp {fmtIDR(trx?.panjar)}</td>
            </tr>
            <tr>
              <td style={{ color: "#555" }}>Sisa</td>
              <td style={{ color: "#555" }}>:</td>
              <td style={{ textAlign: "right", fontWeight: "700", color: Number(trx?.sisa) > 0 ? "#b91c1c" : "#15803d" }}>
                Rp {fmtIDR(trx?.sisa)}
              </td>
            </tr>
            {trx?.metode1 && (
              <tr>
                <td style={{ color: "#777", fontSize: "10px" }}>Metode 1</td>
                <td style={{ color: "#777", fontSize: "10px" }}>:</td>
                <td style={{ textAlign: "right", fontSize: "10px" }}>
                  {trx.metode1}{trx.jumlah_bayar_1 > 0 ? ` (Rp ${fmtIDR(trx.jumlah_bayar_1)})` : ""}
                </td>
              </tr>
            )}
            {trx?.metode2 && (
              <tr>
                <td style={{ color: "#777", fontSize: "10px" }}>Metode 2</td>
                <td style={{ color: "#777", fontSize: "10px" }}>:</td>
                <td style={{ textAlign: "right", fontSize: "10px" }}>
                  {trx.metode2}{trx.jumlah_bayar_2 > 0 ? ` (Rp ${fmtIDR(trx.jumlah_bayar_2)})` : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Status badge */}
        <div style={{ ...styles.center, marginTop: "8px" }}>
          <span style={trx?.status_pembayaran === "lunas" ? styles.statusLunas : styles.statusPanjar}>
            {trx?.status_pembayaran === "lunas" ? "✓ LUNAS" : "PANJAR"}
          </span>
        </div>

        {/* Status kacamata */}
        {isKacamata && (
          <>
            <Divider />
            <div style={{ fontSize: "10px", color: "#666", textAlign: "center", lineHeight: "1.7" }}>
              <div>Kacamata: <b style={{ color: "#111" }}>
                {trx?.status_kacamata === "sudah_selesai" ? "Selesai" : "Dalam Proses"}
              </b></div>
              <div>Pengambilan: <b style={{ color: "#111" }}>
                {trx?.status_pengambilan === "sudah_diambil" ? "Sudah Diambil" : "Belum Diambil"}
              </b></div>
            </div>
          </>
        )}

        <Divider />

        {/* Footer */}
        <div style={{ ...styles.center, fontSize: "10px", color: "#888", lineHeight: "1.7" }}>
          <div>Terima kasih atas kunjungan Anda!</div>
          <div>Barang yang sudah dibeli tidak dapat</div>
          <div>ditukar / dikembalikan.</div>
          <div style={{ marginTop: "6px", fontWeight: "600", color: "#555" }}>— Optik Kasih —</div>
        </div>
      </div>
    </>
  );
}

// Halaman standalone — tidak memakai layout sidebar.
PrintBon.layout = (page) => page;
