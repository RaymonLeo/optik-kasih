<?php

// appV1.0 Rev 10 - Auto-format kode_pasien juga diterapkan saat input manual (Tambah & Edit), bukan cuma saat import.

namespace App\Http\Controllers;

use App\Models\Pasien;
use App\Models\ActivityLog;
use App\Models\DeletionRequest;
use App\Support\SystemNotifier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PasienController extends Controller
{
    // GET /pasien
    public function index(Request $request)
    {
        $q      = trim($request->get('q', ''));
        $letter = strtoupper(trim($request->get('letter', '')));
        $sort   = $request->get('sort', 'asc') === 'desc' ? 'desc' : 'asc';

        // Letter filter only applies if no free-text search is active
        $activeLetter = ($q === '' && $letter !== '' && strlen($letter) === 1 && ctype_alpha($letter))
            ? $letter
            : '';

        $patients = Pasien::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('nama_pasien',   'like', "%{$q}%")
                        ->orWhere('kode_pasien',  'like', "%{$q}%")
                        ->orWhere('nohp_pasien',  'like', "%{$q}%")
                        ->orWhere('alamat_pasien','like', "%{$q}%");
                });
            })
            ->when($activeLetter !== '', function ($query) use ($activeLetter) {
                $query->where('nama_pasien', 'like', "{$activeLetter}%");
            })
            ->orderBy('nama_pasien', $sort)
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Pasien $p) => [
                'id'             => $p->id,
                'kode_pasien'    => $p->kode_pasien,
                'nama_pasien'    => $p->nama_pasien,
                'alamat_pasien'  => $p->alamat_pasien,
                'tanggal_lahir'  => optional($p->tanggal_lahir)->toDateString(),
                'tanggal_buat'   => optional($p->tanggal_buat)->toDateString(),
                'nohp_pasien'    => $p->nohp_pasien,
                'status'         => $p->status ?? 'aktif',
            ]);

        return Inertia::render('Pasien/Index', [
            'patients'     => $patients,
            'filters'      => ['q' => $q, 'letter' => $activeLetter, 'sort' => $sort],
            'importErrors' => session('import_errors', []),
        ]);
    }

    public function create()
    {
        return Inertia::render('Pasien/Create');
    }

    // Input manual: semua field wajib diisi (kecuali tanggal_lahir)
    public function store(Request $request)
    {
        $data = $request->validate([
            'kode_pasien'   => 'required|string|max:20',
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'required|date',
            'alamat_pasien' => 'required|string',
            'nohp_pasien'   => ['required', 'regex:/^\d{8,15}$/'],
            'tanggal_lahir' => 'nullable|date',
        ]);

        // Samakan panjang kode_pasien dengan hasil import (huruf depan + 7 digit),
        // supaya "1", "2", "3" dsb otomatis jadi sepanjang kode yang lain.
        $data['kode_pasien'] = $this->buildKodePasien($data['kode_pasien'], $data['nama_pasien']);

        if (Pasien::where('kode_pasien', $data['kode_pasien'])->exists()) {
            return back()
                ->withErrors(['kode_pasien' => "Kode pasien sudah dipakai (setelah diformat menjadi \"{$data['kode_pasien']}\"). Gunakan kode lain."])
                ->withInput();
        }

        $pasien = Pasien::create($data);
        $this->log('create', $pasien, ['snapshot' => $this->patientSnapshot($pasien)]);

        return redirect()->route('pasien.index')->with('success', 'Pasien berhasil ditambahkan.');
    }

    public function show(Pasien $pasien)
    {
        $healths = $pasien->kesehatan()
            ->latest('tanggal_periksa')
            ->get()
            ->map(function ($h) {
                return [
                    'id'               => $h->id,
                    'tanggal_periksa'  => optional($h->tanggal_periksa)->toDateString(),
                    'kanan' => [
                        'sph'   => $h->sph_kanan,
                        'cyl'   => $h->cyl_kanan,
                        'axis'  => $h->axis_kanan,
                        'prism' => $h->prism_kanan,
                        'base'  => $h->base_kanan,
                        'add'   => $h->add_kanan,
                        'mpd'   => $h->pd_kanan,
                    ],
                    'kiri' => [
                        'sph'   => $h->sph_kiri,
                        'cyl'   => $h->cyl_kiri,
                        'axis'  => $h->axis_kiri,
                        'prism' => $h->prism_kiri,
                        'base'  => $h->base_kiri,
                        'add'   => $h->add_kiri,
                        'mpd'   => $h->pd_kiri,
                    ],
                ];
            });

        return Inertia::render('Pasien/Show', [
            'patient' => [
                'id'            => $pasien->id,
                'kode_pasien'   => $pasien->kode_pasien,
                'nama_pasien'   => $pasien->nama_pasien,
                'tanggal_buat'  => optional($pasien->tanggal_buat)->toDateString(),
                'alamat_pasien' => $pasien->alamat_pasien,
                'nohp_pasien'   => $pasien->nohp_pasien,
                'tanggal_lahir' => optional($pasien->tanggal_lahir)->toDateString(),
                'status'        => $pasien->status ?? 'aktif',
            ],
            'healths' => $healths,
        ]);
    }

    public function edit(Pasien $pasien)
    {
        return Inertia::render('Pasien/Edit', [
            'patient' => [
                'id'            => $pasien->id,
                'kode_pasien'   => $pasien->kode_pasien,
                'nama_pasien'   => $pasien->nama_pasien,
                'tanggal_buat'  => optional($pasien->tanggal_buat)->toDateString(),
                'alamat_pasien' => $pasien->alamat_pasien,
                'nohp_pasien'   => $pasien->nohp_pasien,
                'tanggal_lahir' => optional($pasien->tanggal_lahir)->toDateString(),
                'status'        => $pasien->status ?? 'aktif',
            ],
        ]);
    }

    public function update(Request $request, Pasien $pasien)
    {
        $rules = [
            'kode_pasien'   => 'required|string|max:20',
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'nullable|date',
            'alamat_pasien' => 'nullable|string',
            'nohp_pasien'   => ['nullable', 'regex:/^\d{8,15}$/'],
            'tanggal_lahir' => 'nullable|date',
            'status'        => ['nullable', 'in:aktif,nonaktif'],
            'change_reason' => auth()->user()->role === 'admin'
                ? ['required', 'string', 'max:1000']
                : ['nullable', 'string', 'max:1000'],
        ];
        $data = $request->validate($rules);
        $reason = $data['change_reason'] ?? null;
        unset($data['change_reason']);

        // Samakan panjang kode_pasien dengan hasil import (huruf depan + 7 digit).
        // Kode yang sudah terformat (mis. "R0041623") tidak berubah saat diproses ulang.
        $data['kode_pasien'] = $this->buildKodePasien($data['kode_pasien'], $data['nama_pasien']);

        if (Pasien::where('kode_pasien', $data['kode_pasien'])->where('id', '!=', $pasien->id)->exists()) {
            return back()
                ->withErrors(['kode_pasien' => "Kode pasien sudah dipakai (setelah diformat menjadi \"{$data['kode_pasien']}\"). Gunakan kode lain."])
                ->withInput();
        }

        $before = $this->patientSnapshot($pasien);

        $pasien->update($data);
        $after = $this->patientSnapshot($pasien);
        $changed = collect($after)
            ->filter(fn ($value, $key) => $before[$key] !== $value)
            ->map(fn ($value, $key) => ['dari' => $before[$key], 'menjadi' => $value])
            ->all();
        $this->log('update', $pasien, [
            'cabang' => auth()->user()->name,
            'alasan_perubahan' => $reason,
            'perubahan' => $changed,
        ]);

        if (auth()->user()->role === 'admin') {
            SystemNotifier::toSuperAdmins(
                'patient_updated',
                'Perubahan data pasien',
                sprintf('Cabang %s mengubah pasien #%d (%s). Alasan: %s', auth()->user()->name, $pasien->id, $pasien->nama_pasien, $reason),
                route('pasien.edit', $pasien),
                [
                    'patient_id' => $pasien->id,
                    'patient_name' => $pasien->nama_pasien,
                    'branch' => auth()->user()->name,
                    'reason' => $reason,
                ],
            );
        }

        return redirect()->route('pasien.edit', $pasien)->with('success', 'Pasien berhasil diperbarui.');
    }

    public function destroy(Request $request, Pasien $pasien)
    {
        if (auth()->user()->role === 'admin') {
            $data = $request->validate([
                'delete_reason' => ['required', 'string', 'max:1000'],
            ]);

            $pending = DeletionRequest::query()
                ->where('requester_id', auth()->id())
                ->where('subject_type', 'pasien')
                ->where('subject_id', $pasien->id)
                ->where('status', DeletionRequest::PENDING)
                ->exists();

            if ($pending) {
                return back()->with('error', 'Permintaan penghapusan pasien ini masih menunggu persetujuan.');
            }

            $deletionRequest = DeletionRequest::create([
                'requester_id' => auth()->id(),
                'subject_type' => 'pasien',
                'subject_id' => $pasien->id,
                'subject_label' => "Pasien #{$pasien->id} - {$pasien->nama_pasien}",
                'reason' => $data['delete_reason'],
                'snapshot' => $this->patientSnapshot($pasien),
            ]);

            $this->log('delete_requested', $pasien, [
                'cabang' => auth()->user()->name,
                'deletion_request_id' => $deletionRequest->id,
                'alasan_penghapusan' => $data['delete_reason'],
                'snapshot' => $deletionRequest->snapshot,
            ]);

            SystemNotifier::toSuperAdmins(
                'deletion_requested',
                'Persetujuan penghapusan pasien',
                sprintf('Cabang %s meminta penghapusan pasien #%d (%s).', auth()->user()->name, $pasien->id, $pasien->nama_pasien),
                route('super_admin.deletion_requests.index'),
                ['deletion_request_id' => $deletionRequest->id, 'subject_type' => 'pasien'],
            );

            return redirect()->route('pasien.index')->with('success', 'Permintaan penghapusan dikirim ke superadmin.');
        }

        $this->log('delete', $pasien, [
            'snapshot' => $this->patientSnapshot($pasien),
            'dihapus_langsung_oleh_superadmin' => true,
        ]);
        $pasien->delete();
        return redirect()->route('pasien.index')->with('success', 'Pasien berhasil dihapus.');
    }

    // Template Excel untuk import — kolom sesuai nama di website
    public function importTemplate()
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('A');

        $headers = ['No', 'Nama Pasien', 'Kode Pasien', 'Tanggal Daftar', 'Alamat', 'No. HP'];
        foreach ($headers as $col => $header) {
            $cell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1) . '1';
            $sheet->setCellValue($cell, $header);
            $sheet->getStyle($cell)->getFont()->setBold(true);
            $sheet->getStyle($cell)->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFFFFF00');
        }

        // Kode Pasien: isi angka saja (mis. "250"), sistem auto-prefix huruf + pad 7 digit → "B0000250"
        $examples = [
            ['1', 'Aroen',  '',    '14-04-2007', 'Jl. Arengka No. 1',  '08123456789'],
            ['2', 'Budi',   '250', '01-01-2008', 'Jl. Sudirman No. 5', '08120000001'],
            ['3', 'Candra', '',    '15-03-2009', 'Jl. Riau No. 10',    ''],
        ];

        foreach ($examples as $rowIdx => $rowData) {
            foreach ($rowData as $colIdx => $val) {
                $cell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1) . ($rowIdx + 2);
                $sheet->setCellValue($cell, $val);
            }
        }

        foreach (range(1, 6) as $col) {
            $sheet->getColumnDimensionByColumn($col)->setAutoSize(true);
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

        $filename = 'template_pasien.xlsx';
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        $writer->save('php://output');
        exit;
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:20480'],
        ]);

        $ext  = strtolower($request->file('file')->getClientOriginalExtension());
        $path = $request->file('file')->getRealPath();

        if (in_array($ext, ['xlsx', 'xls'])) {
            return $this->importFromExcel($path);
        }

        return $this->importFromCsv($path);
    }

    private function importFromExcel(string $path): \Illuminate\Http\RedirectResponse
    {
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
        $sheetNames  = $spreadsheet->getSheetNames();

        $imported  = 0;
        $skipped   = 0;
        $rowErrors = [];

        foreach ($sheetNames as $sheetName) {
            $sheet    = $spreadsheet->getSheetByName($sheetName);
            $dataRows = array_slice($sheet->toArray(null, true, true, false), 1);

            foreach ($dataRows as $idx => $row) {
                $actualRow = $idx + 2;
                $cols      = array_values(array_slice($row, 0, 6));

                // Kolom: No | Nama Pasien | Kode Pasien (atau No Bon) | Tanggal Daftar | Alamat | No. HP
                $nama    = $this->trimVal($cols[1] ?? null);
                $kodeRaw = $this->trimVal($cols[2] ?? null);
                $tanggal = $this->trimVal($cols[3] ?? null);
                $alamat  = $this->trimVal($cols[4] ?? null);
                $nohp    = $this->trimVal($cols[5] ?? null);

                if (!$nama) continue;

                $nama   = $this->cleanName($nama);
                $alamat = $this->cleanName($alamat);
                $kode   = $this->buildKodePasien($kodeRaw, $nama);

                if ($kode !== null && Pasien::where('kode_pasien', $kode)->exists()) {
                    $rowErrors[] = "Sheet {$sheetName} Baris {$actualRow}: Kode Pasien '{$kode}' sudah terdaftar, dilewati.";
                    $skipped++;
                    continue;
                }

                $pasien = Pasien::create([
                    'kode_pasien'   => $kode,
                    'nama_pasien'   => $nama,
                    'tanggal_buat'  => $this->parseFlexDate($tanggal),
                    'alamat_pasien' => $alamat,
                    'nohp_pasien'   => $this->cleanNohp($nohp),
                    'tanggal_lahir' => null,
                    'status'        => 'aktif',
                ]);
                $this->log('import', $pasien, ['imported_via' => 'excel', 'sheet' => $sheetName]);
                $imported++;
            }
        }

        $msg = "{$imported} pasien berhasil diimpor dari Excel.";
        if ($skipped > 0) $msg .= " {$skipped} baris dilewati.";

        session()->flash('import_errors', $rowErrors);
        return redirect()->route('pasien.index')->with('success', $msg);
    }

    private function importFromCsv(string $path): \Illuminate\Http\RedirectResponse
    {
        $handle = fopen($path, 'r');

        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        fgetcsv($handle); // skip header

        $imported  = 0;
        $skipped   = 0;
        $rowErrors = [];
        $rowNum    = 1;

        while (($cols = fgetcsv($handle)) !== false) {
            $rowNum++;
            if (count($cols) < 2) continue;

            // Kolom CSV: No | Nama Pasien | Kode Pasien | Tanggal Daftar | Alamat | No. HP
            $nama    = $this->trimVal($cols[1] ?? null);
            $kodeRaw = $this->trimVal($cols[2] ?? null);
            $tanggal = $this->trimVal($cols[3] ?? null);
            $alamat  = $this->trimVal($cols[4] ?? null);
            $nohp    = $this->trimVal($cols[5] ?? null);

            if (!$nama) {
                $rowErrors[] = "Baris {$rowNum}: nama wajib diisi, dilewati.";
                $skipped++;
                continue;
            }

            $nama   = $this->cleanName($nama);
            $alamat = $this->cleanName($alamat);
            $kode   = $this->buildKodePasien($kodeRaw, $nama);

            if ($kode !== null && Pasien::where('kode_pasien', $kode)->exists()) {
                $rowErrors[] = "Baris {$rowNum}: Kode Pasien '{$kode}' sudah terdaftar, dilewati.";
                $skipped++;
                continue;
            }

            $pasien = Pasien::create([
                'kode_pasien'   => $kode,
                'nama_pasien'   => $nama,
                'tanggal_buat'  => $this->parseFlexDate($tanggal),
                'alamat_pasien' => $alamat,
                'nohp_pasien'   => $this->cleanNohp($nohp),
                'tanggal_lahir' => null,
                'status'        => 'aktif',
            ]);
            $this->log('import', $pasien, ['imported_via' => 'csv']);
            $imported++;
        }

        fclose($handle);

        $msg = "{$imported} pasien berhasil diimpor dari CSV.";
        if ($skipped > 0) $msg .= " {$skipped} baris dilewati.";

        session()->flash('import_errors', $rowErrors);
        return redirect()->route('pasien.index')->with('success', $msg);
    }

    /**
     * Bangun kode_pasien dari kolom "Kode Pasien" / "No Bon":
     *  - Sudah ada huruf di depan + digit → pad digit ke 7 (mis. "B250" → "B0000250").
     *  - Hanya digit → prefix huruf pertama nama + pad ke 7 (mis. "250" + Budi → "B0000250").
     *  - Non-standard (ada tanda baca/tanggal) → prefix huruf + simpan as-is.
     *  - Kosong → null.
     */
    private function buildKodePasien(?string $rawKode, ?string $nama): ?string
    {
        if ($rawKode === null || $rawKode === '') return null;

        $prefix = strtoupper(substr(ltrim((string) $nama), 0, 1));

        if (preg_match('/^[A-Za-z]/', $rawKode)) {
            $letter = strtoupper($rawKode[0]);
            $rest   = substr($rawKode, 1);
            // Digit-only suffix → zero-pad ke 7
            return ctype_digit($rest)
                ? $letter . str_pad($rest, 7, '0', STR_PAD_LEFT)
                : $letter . $rest;
        }

        // Hanya digit → prefix + pad ke 7
        if (ctype_digit($rawKode)) {
            return $prefix . str_pad($rawKode, 7, '0', STR_PAD_LEFT);
        }

        // Non-standard (tanda baca, tanggal, dll) → prefix + raw
        return $prefix . $rawKode;
    }

    /**
     * Title case: Capitalize huruf pertama setiap kata.
     * Menggunakan titik (.) sebagai pemisah kata tambahan selain spasi,
     * sehingga "Jl.Arengka" → "Jl.Arengka" dan "H.M." tetap rapi.
     */
    private function cleanName(?string $val): ?string
    {
        if ($val === null) return null;
        $str = trim($val);
        if ($str === '') return null;
        return ucwords(strtolower($str), " .");
    }

    /**
     * Bersihkan nomor HP:
     *  - Strip semua non-digit.
     *  - Jika dimulai "62" dan panjang ≥ 11 → ganti "62" dengan "0".
     *  - Harus 8–15 digit, kalau tidak → null.
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

    private function trimVal(mixed $val): ?string
    {
        if ($val === null) return null;
        $str = trim((string) $val);
        return $str === '' ? null : $str;
    }

    private function parseFlexDate(?string $raw): ?string
    {
        if (!$raw) return null;

        $normalized = preg_replace('/[^0-9]+/', ' ', $raw);
        $parts      = array_values(array_filter(explode(' ', trim($normalized)), fn($p) => $p !== ''));

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

    private function patientSnapshot(Pasien $pasien): array
    {
        return [
            'kode_pasien'   => $pasien->kode_pasien,
            'nama_pasien'   => $pasien->nama_pasien,
            'tanggal_buat'  => optional($pasien->tanggal_buat)->toDateString(),
            'alamat_pasien' => $pasien->alamat_pasien,
            'nohp_pasien'   => $pasien->nohp_pasien,
            'tanggal_lahir' => optional($pasien->tanggal_lahir)->toDateString(),
            'status'        => $pasien->status ?? 'aktif',
        ];
    }

    private function log(string $action, Pasien $pasien, array $details = []): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model' => Pasien::class,
            'model_id' => $pasien->id,
            'details' => array_merge([
                'pasien_id' => $pasien->id,
                'kode_pasien' => $pasien->kode_pasien,
                'nama_pasien' => $pasien->nama_pasien,
            ], $details),
        ]);
    }
}
