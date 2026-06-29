<?php

// appV1.0 Rev 7 - Support import Excel multi-sheet (A-Z) dan template Excel.

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
        $q = trim($request->get('q', ''));

        $patients = Pasien::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('nama_pasien',   'like', "%{$q}%")
                        ->orWhere('kode_pasien',  'like', "%{$q}%")
                        ->orWhere('nohp_pasien',  'like', "%{$q}%")
                        ->orWhere('alamat_pasien','like', "%{$q}%");
                });
            })
            ->orderBy('nama_pasien')
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
            'filters'      => ['q' => $q],
            'importErrors' => session('import_errors', []),
        ]);
    }

    public function create()
    {
        return Inertia::render('Pasien/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode_pasien'   => 'required|string|max:20|unique:pasien,kode_pasien',
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'nullable|date',
            'alamat_pasien' => 'nullable|string',
            // telepon hanya angka 8-15 digit:
            'nohp_pasien'   => ['nullable', 'regex:/^\d{8,15}$/'],
            'tanggal_lahir' => 'nullable|date',
        ]);

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
            'kode_pasien'   => 'required|string|max:20|unique:pasien,kode_pasien,' . $pasien->id,
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

    public function importTemplate()
    {
        // Generate Excel template dengan format yang sama seperti Data pasien new.xlsx
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('A');

        // Header — sesuai format Excel asli
        $headers = ['No', 'Nama', 'No Bon', 'Tanggal', 'Alamat', 'NO.HP'];
        foreach ($headers as $col => $header) {
            $cell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1) . '1';
            $sheet->setCellValue($cell, $header);
            $sheet->getStyle($cell)->getFont()->setBold(true);
            $sheet->getStyle($cell)->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFFFFF00');
        }

        // Contoh data
        $examples = [
            ['1', 'Aroen',    '',    '14-04-2007', 'Jl. Arengka No. 1', '08123456789'],
            ['2', 'Budi',   '250',   '01-01-2008', 'Jl. Sudirman No. 5', '0812000001'],
            ['3', 'Candra',  '',     '15-03-2009', 'Jl. Riau No. 10',   ''],
        ];

        foreach ($examples as $rowIdx => $rowData) {
            foreach ($rowData as $colIdx => $val) {
                $cell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1) . ($rowIdx + 2);
                $sheet->setCellValue($cell, $val);
            }
        }

        // Auto width kolom
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

                $nama    = $this->trimVal($cols[1] ?? null);
                $noBon   = $this->trimVal($cols[2] ?? null);
                $tanggal = $this->trimVal($cols[3] ?? null);
                $alamat  = $this->trimVal($cols[4] ?? null);
                $nohp    = $this->trimVal($cols[5] ?? null);

                if (!$nama) continue;

                $kode = ($noBon !== null && $noBon !== '') ? $noBon : null;

                if ($kode !== null && Pasien::where('kode_pasien', $kode)->exists()) {
                    $rowErrors[] = "Sheet {$sheetName} Baris {$actualRow}: No Bon '{$kode}' sudah terdaftar, dilewati.";
                    $skipped++;
                    continue;
                }

                $nohpClean = null;
                if ($nohp) {
                    $digits    = preg_replace('/\D/', '', $nohp);
                    $nohpClean = strlen($digits) >= 5 ? $digits : null;
                }

                $pasien = Pasien::create([
                    'kode_pasien'   => $kode,
                    'nama_pasien'   => $nama,
                    'tanggal_buat'  => $this->parseFlexDate($tanggal),
                    'alamat_pasien' => $alamat,
                    'nohp_pasien'   => $nohpClean,
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

        // Lewati BOM jika ada
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

            // Kolom CSV: nama_pasien, No Bon (kode), Tanggal, Alamat, NO.HP
            // (mengikuti format template baru: No, Nama, No Bon, Tanggal, Alamat, NO.HP)
            $nama    = $this->trimVal($cols[1] ?? null);
            $kode    = $this->trimVal($cols[2] ?? null);
            $tanggal = $this->trimVal($cols[3] ?? null);
            $alamat  = $this->trimVal($cols[4] ?? null);
            $nohp    = $this->trimVal($cols[5] ?? null);

            if (!$nama) {
                $rowErrors[] = "Baris {$rowNum}: nama wajib diisi, dilewati.";
                $skipped++;
                continue;
            }

            if ($kode !== null && $kode !== '' && Pasien::where('kode_pasien', $kode)->exists()) {
                $rowErrors[] = "Baris {$rowNum}: No Bon '{$kode}' sudah terdaftar, dilewati.";
                $skipped++;
                continue;
            }

            $nohpClean = null;
            if ($nohp) {
                $digits    = preg_replace('/\D/', '', $nohp);
                $nohpClean = strlen($digits) >= 5 ? $digits : null;
            }

            $pasien = Pasien::create([
                'kode_pasien'   => ($kode !== '' ? $kode : null),
                'nama_pasien'   => $nama,
                'tanggal_buat'  => $this->parseFlexDate($tanggal),
                'alamat_pasien' => $alamat,
                'nohp_pasien'   => $nohpClean,
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
