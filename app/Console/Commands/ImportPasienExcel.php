<?php

// appV1.0 Rev 3 - Auto-format: kode 7-digit, nama/alamat title case, nohp min 8 digit.

namespace App\Console\Commands;

use App\Models\Pasien;
use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportPasienExcel extends Command
{
    protected $signature   = 'pasien:import-excel {file? : Path to Excel file (default: "Data pasien new.xlsx")} {--fresh : Hapus semua data pasien sebelum import}';
    protected $description = 'Import data pasien dari Excel multi-sheet (A-Z). Kode Pasien auto-prefix + 7-digit pad. Nama/alamat auto title case.';

    public function handle(): int
    {
        $file = $this->argument('file') ?: base_path('Data pasien new.xlsx');

        if (! file_exists($file)) {
            $this->error("File tidak ditemukan: {$file}");
            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            $count = Pasien::count();
            if ($this->confirm("Hapus {$count} data pasien yang ada sebelum import?", false)) {
                Pasien::truncate();
                $this->info("Semua data pasien dihapus.");
            }
        }

        $this->info("Membaca: {$file}");
        $spreadsheet = IOFactory::load($file);
        $sheetNames  = $spreadsheet->getSheetNames();
        $this->info('Sheet: ' . implode(', ', $sheetNames));

        $imported = 0;
        $skipped  = 0;
        $errors   = [];

        foreach ($sheetNames as $sheetName) {
            $sheet    = $spreadsheet->getSheetByName($sheetName);
            $rows     = $sheet->toArray(null, true, true, false);
            $dataRows = array_slice($rows, 1);
            $count    = 0;

            foreach ($dataRows as $rowIndex => $row) {
                $actualRow = $rowIndex + 2;
                $cols      = array_values(array_slice($row, 0, 6));

                // Kolom Excel: No | Nama | No Bon | Tanggal | Alamat | NO.HP
                $nama    = $this->clean($cols[1] ?? null);
                $noBon   = $this->clean($cols[2] ?? null);
                $tanggal = $this->clean($cols[3] ?? null);
                $alamat  = $this->clean($cols[4] ?? null);
                $nohp    = $this->clean($cols[5] ?? null);

                if (!$nama) continue;

                $nama   = $this->cleanName($nama);
                $alamat = $this->cleanName($alamat);
                $kode   = $this->buildKode($noBon, $nama);

                if ($kode !== null && Pasien::where('kode_pasien', $kode)->exists()) {
                    $errors[] = "Sheet {$sheetName} Baris {$actualRow}: kode '{$kode}' sudah ada, dilewati.";
                    $skipped++;
                    continue;
                }

                Pasien::create([
                    'kode_pasien'   => $kode,
                    'nama_pasien'   => $nama,
                    'tanggal_buat'  => $this->parseDate($tanggal),
                    'alamat_pasien' => $alamat,
                    'nohp_pasien'   => $this->cleanNohp($nohp),
                    'tanggal_lahir' => null,
                    'status'        => 'aktif',
                ]);

                $imported++;
                $count++;
            }

            $this->line("  Sheet {$sheetName}: {$count} imported");
        }

        $this->info('');
        $this->info("Import selesai: {$imported} berhasil, {$skipped} dilewati.");

        if (count($errors) > 0) {
            $this->warn('Peringatan (20 pertama):');
            foreach (array_slice($errors, 0, 20) as $err) {
                $this->warn("  - {$err}");
            }
            if (count($errors) > 20) {
                $this->warn('  ... dan ' . (count($errors) - 20) . ' peringatan lainnya.');
            }
        }

        return self::SUCCESS;
    }

    /**
     * Bangun kode_pasien:
     *  - Huruf di depan + digit → pad digit ke 7 (mis. "B250" → "B0000250").
     *  - Hanya digit → prefix huruf pertama nama + pad ke 7.
     *  - Non-standard (tanda baca/tanggal) → prefix huruf + raw.
     *  - Kosong → null.
     */
    private function buildKode(?string $noBon, string $nama): ?string
    {
        if ($noBon === null || $noBon === '') return null;

        $prefix = strtoupper(substr(ltrim($nama), 0, 1));

        if (preg_match('/^[A-Za-z]/', $noBon)) {
            $letter = strtoupper($noBon[0]);
            $rest   = substr($noBon, 1);
            return ctype_digit($rest)
                ? $letter . str_pad($rest, 7, '0', STR_PAD_LEFT)
                : $letter . $rest;
        }

        if (ctype_digit($noBon)) {
            return $prefix . str_pad($noBon, 7, '0', STR_PAD_LEFT);
        }

        return $prefix . $noBon;
    }

    /**
     * Title case: capitalize huruf pertama setiap kata (spasi dan titik sebagai pemisah).
     */
    private function cleanName(?string $val): ?string
    {
        if ($val === null) return null;
        $str = trim($val);
        if ($str === '') return null;
        return ucwords(strtolower($str), " .");
    }

    /**
     * Bersihkan nomor HP: strip non-digit, handle prefix +62/62, validasi 8-15 digit.
     */
    private function cleanNohp(?string $val): ?string
    {
        if (!$val) return null;
        $digits = preg_replace('/\D/', '', $val);
        if (str_starts_with($digits, '62') && strlen($digits) >= 11) {
            $digits = '0' . substr($digits, 2);
        }
        return (strlen($digits) >= 8 && strlen($digits) <= 15) ? $digits : null;
    }

    private function clean(mixed $val): ?string
    {
        if ($val === null) return null;
        $str = trim((string) $val);
        return $str === '' ? null : $str;
    }

    /**
     * Parse format tanggal beragam: "14 - 4 - 07", "04-04-08", "11/10/2009"
     * Asumsi urutan: DD - MM - YY
     */
    private function parseDate(?string $raw): ?string
    {
        if (!$raw) return null;

        $parts = array_values(array_filter(
            explode(' ', preg_replace('/[^0-9]+/', ' ', $raw)),
            fn($p) => $p !== ''
        ));

        if (count($parts) < 3) return null;

        $day   = (int) $parts[0];
        $month = (int) $parts[1];
        $year  = (int) $parts[2];

        if ($month > 12 && $day <= 12) [$day, $month] = [$month, $day];
        if ($year < 100) $year += 2000;
        if ($day < 1 || $day > 31 || $month < 1 || $month > 12) return null;
        if ($year < 1900 || $year > 2099) return null;

        try {
            return \Carbon\Carbon::createFromDate($year, $month, $day)->toDateString();
        } catch (\Exception $e) {
            return null;
        }
    }
}
