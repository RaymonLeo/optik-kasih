<?php

// appV1.0 Rev 1 - Import massal data pasien dari Excel multi-sheet (A-Z).

namespace App\Console\Commands;

use App\Models\Pasien;
use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportPasienExcel extends Command
{
    protected $signature   = 'pasien:import-excel {file? : Path to Excel file (default: "Data pasien new.xlsx")}';
    protected $description = 'Import data pasien dari Excel multi-sheet (A-Z). Kolom: No, Nama, No Bon (kode_pasien), Tanggal (tanggal_buat), Alamat, NO.HP';

    public function handle(): int
    {
        $file = $this->argument('file') ?: base_path('Data pasien new.xlsx');

        if (! file_exists($file)) {
            $this->error("File tidak ditemukan: {$file}");
            return self::FAILURE;
        }

        $this->info("Membaca file: {$file}");
        $spreadsheet = IOFactory::load($file);
        $sheetNames  = $spreadsheet->getSheetNames();
        $this->info('Sheet ditemukan: ' . implode(', ', $sheetNames));

        $imported = 0;
        $skipped  = 0;
        $errors   = [];

        foreach ($sheetNames as $sheetName) {
            $sheet = $spreadsheet->getSheetByName($sheetName);
            $rows  = $sheet->toArray(null, true, true, false);

            if (empty($rows)) continue;

            // Skip baris header (baris 0)
            $dataRows = array_slice($rows, 1);
            $sheetCount = 0;

            foreach ($dataRows as $rowIndex => $row) {
                $actualRow = $rowIndex + 2; // +2 karena 0-based + skip header

                // Ambil 6 kolom pertama saja
                $cols = array_values(array_slice($row, 0, 6));

                $nama   = $this->clean($cols[1] ?? null);
                $noBon  = $this->clean($cols[2] ?? null);
                $tanggal = $this->clean($cols[3] ?? null);
                $alamat = $this->clean($cols[4] ?? null);
                $nohp   = $this->clean($cols[5] ?? null);

                // Skip baris tanpa nama
                if ($nama === null || $nama === '') continue;

                // Parse kode_pasien
                $kodePasien = ($noBon !== null && $noBon !== '') ? $noBon : null;

                // Cek duplikat kode_pasien (hanya jika tidak null)
                if ($kodePasien !== null && Pasien::where('kode_pasien', $kodePasien)->exists()) {
                    $errors[] = "Sheet {$sheetName} Baris {$actualRow}: kode '{$kodePasien}' sudah ada, dilewati.";
                    $skipped++;
                    continue;
                }

                // Cek duplikat nama + tanggal_buat (hindari data persis sama)
                $tanggalBuat = $this->parseDate($tanggal);

                // Parse nomor HP — hanya angka
                $nohpClean = null;
                if ($nohp !== null && $nohp !== '') {
                    $nohpDigits = preg_replace('/\D/', '', $nohp);
                    $nohpClean = (strlen($nohpDigits) >= 5) ? $nohpDigits : null;
                }

                Pasien::create([
                    'kode_pasien'   => $kodePasien,
                    'nama_pasien'   => $nama,
                    'tanggal_buat'  => $tanggalBuat,
                    'alamat_pasien' => $alamat ?: null,
                    'nohp_pasien'   => $nohpClean,
                    'tanggal_lahir' => null,
                    'status'        => 'aktif',
                ]);

                $imported++;
                $sheetCount++;
            }

            $this->line("  Sheet {$sheetName}: {$sheetCount} imported");
        }

        $this->info('');
        $this->info("Import selesai: {$imported} berhasil, {$skipped} dilewati.");

        if (count($errors) > 0) {
            $this->warn('Peringatan:');
            foreach (array_slice($errors, 0, 20) as $err) {
                $this->warn("  - {$err}");
            }
            if (count($errors) > 20) {
                $this->warn('  ... dan ' . (count($errors) - 20) . ' peringatan lainnya.');
            }
        }

        return self::SUCCESS;
    }

    private function clean(mixed $val): ?string
    {
        if ($val === null) return null;
        $str = trim((string) $val);
        return $str === '' ? null : $str;
    }

    /**
     * Parse berbagai format tanggal dari data Excel lama:
     * "14  - 4 - 07", "04-04-08", "9 - -10 - 09", "11/10/2009"
     * Semua dalam format DD-MM-YY atau DD-MM-YYYY
     */
    private function parseDate(?string $raw): ?string
    {
        if ($raw === null || $raw === '') return null;

        // Normalisasi: hilangkan semua karakter non-digit, sisakan sebagai pemisah
        // Ganti semua non-digit sequence dengan spasi
        $normalized = preg_replace('/[^0-9]+/', ' ', $raw);
        $normalized = trim($normalized);

        if ($normalized === '') return null;

        $parts = array_values(array_filter(explode(' ', $normalized), fn($p) => $p !== ''));

        // Butuh minimal 3 bagian: DD, MM, YY
        if (count($parts) < 3) return null;

        $day   = (int) $parts[0];
        $month = (int) $parts[1];
        $year  = (int) $parts[2];

        // Validasi month (1-12) — kalau month > 12, coba swap (MM-DD-YY)
        if ($month > 12 && $day <= 12) {
            [$day, $month] = [$month, $day];
        }

        // 2-digit year: asumsikan 2000s (07 → 2007, 18 → 2018)
        if ($year < 100) {
            $year += 2000;
        }

        // Validasi range
        if ($day < 1 || $day > 31) return null;
        if ($month < 1 || $month > 12) return null;
        if ($year < 1990 || $year > 2030) return null;

        try {
            $date = \Carbon\Carbon::createFromDate($year, $month, $day);
            return $date->toDateString();
        } catch (\Exception $e) {
            return null;
        }
    }
}
