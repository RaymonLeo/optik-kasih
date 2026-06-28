<?php

// appV1.0 Rev 6 - Tambah field status pasien (aktif/nonaktif).

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
    public function index()
    {
        $patients = Pasien::orderByDesc('id')
            ->paginate(10)
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
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template_pasien.csv"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ];

        $callback = function () {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF"); // BOM agar Excel buka UTF-8 dengan benar
            fputcsv($handle, ['kode_pasien', 'nama_pasien', 'tanggal_lahir', 'alamat_pasien', 'nohp_pasien']);
            fputcsv($handle, ['P001', 'Contoh Nama Pasien', '1990-01-15', 'Jl. Contoh No.1, Kota', '08123456789']);
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $path = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');

        // Lewati BOM jika ada
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Lewati baris header
        fgetcsv($handle);

        $imported = 0;
        $skipped = 0;
        $rowErrors = [];
        $rowNum = 1;

        while (($cols = fgetcsv($handle)) !== false) {
            $rowNum++;
            if (count($cols) < 2) continue;

            [$kode, $nama, $tglLahir, $alamat, $nohp] = array_pad($cols, 5, null);
            $kode = trim($kode ?? '');
            $nama = trim($nama ?? '');

            if ($kode === '' || $nama === '') {
                $rowErrors[] = "Baris {$rowNum}: kode_pasien dan nama_pasien wajib diisi.";
                $skipped++;
                continue;
            }

            if (Pasien::where('kode_pasien', $kode)->exists()) {
                $rowErrors[] = "Baris {$rowNum}: kode '{$kode}' sudah terdaftar, dilewati.";
                $skipped++;
                continue;
            }

            $parsedDate = null;
            if (!empty(trim($tglLahir ?? ''))) {
                try {
                    $parsedDate = \Carbon\Carbon::parse(trim($tglLahir))->toDateString();
                } catch (\Exception $e) {
                    $parsedDate = null;
                }
            }

            $pasien = Pasien::create([
                'kode_pasien'   => $kode,
                'nama_pasien'   => $nama,
                'tanggal_lahir' => $parsedDate,
                'alamat_pasien' => trim($alamat ?? ''),
                'nohp_pasien'   => preg_replace('/\D/', '', trim($nohp ?? '')),
                'tanggal_buat'  => now()->toDateString(),
            ]);
            $this->log('import', $pasien, ['imported_via' => 'csv']);
            $imported++;
        }

        fclose($handle);

        $msg = "{$imported} pasien berhasil diimpor.";
        if ($skipped > 0) {
            $msg .= " {$skipped} baris dilewati.";
        }

        session()->flash('import_errors', $rowErrors);
        return redirect()->route('pasien.index')->with('success', $msg);
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
