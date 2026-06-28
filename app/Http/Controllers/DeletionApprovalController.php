<?php

// appV1.0 Rev 4 - Persetujuan superadmin untuk penghapusan pasien dan transaksi.

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DeletionRequest;
use App\Models\Pasien;
use App\Models\Transaksi;
use App\Support\SystemNotifier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeletionApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $query = DeletionRequest::query()->with(['requester:id,name,email', 'reviewer:id,name']);

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($request->filled('admin_id')) {
            $query->where('requester_id', $request->integer('admin_id'));
        }

        return Inertia::render('SuperAdmin/DeletionApprovals', [
            'requests' => $query->latest()->paginate(15)->withQueryString(),
            'admins' => \App\Models\User::query()
                ->where('role', 'admin')
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => $request->only(['status', 'admin_id']),
        ]);
    }

    public function approve(DeletionRequest $deletionRequest): RedirectResponse
    {
        abort_unless($deletionRequest->status === DeletionRequest::PENDING, 422, 'Permintaan ini sudah diproses.');

        $subject = $this->subject($deletionRequest);
        if ($subject === null) {
            $this->cancelMissingSubject($deletionRequest);

            return back()->with('error', 'Data asal sudah tidak tersedia. Permintaan dibatalkan.');
        }

        DB::transaction(function () use ($deletionRequest, $subject) {
            $deletionRequest->update([
                'status' => DeletionRequest::APPROVED,
                'reviewer_id' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'delete',
                'model' => $subject::class,
                'model_id' => $subject->getKey(),
                'details' => [
                    'via_approval_request_id' => $deletionRequest->id,
                    'subject_label' => $deletionRequest->subject_label,
                    'requested_by' => $deletionRequest->requester?->name,
                    'request_reason' => $deletionRequest->reason,
                    'snapshot' => $deletionRequest->snapshot,
                    'approved_by' => auth()->user()->name,
                ],
            ]);

            $subject->delete();
        });

        SystemNotifier::toUser(
            $deletionRequest->requester_id,
            'deletion_approved',
            'Penghapusan disetujui',
            "Permintaan penghapusan {$deletionRequest->subject_label} telah disetujui dan data dihapus.",
            '/notifications',
            ['deletion_request_id' => $deletionRequest->id],
        );

        return back()->with('success', 'Permintaan disetujui dan data berhasil dihapus.');
    }

    public function reject(Request $request, DeletionRequest $deletionRequest): RedirectResponse
    {
        abort_unless($deletionRequest->status === DeletionRequest::PENDING, 422, 'Permintaan ini sudah diproses.');

        $data = $request->validate([
            'reviewer_note' => ['required', 'string', 'max:1000'],
        ]);

        $deletionRequest->update([
            'status' => DeletionRequest::REJECTED,
            'reviewer_id' => auth()->id(),
            'reviewer_note' => $data['reviewer_note'],
            'reviewed_at' => now(),
        ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'delete_rejected',
            'model' => $this->modelClass($deletionRequest->subject_type),
            'model_id' => $deletionRequest->subject_id,
            'details' => [
                'deletion_request_id' => $deletionRequest->id,
                'subject_label' => $deletionRequest->subject_label,
                'requested_by' => $deletionRequest->requester?->name,
                'request_reason' => $deletionRequest->reason,
                'reviewer_note' => $data['reviewer_note'],
            ],
        ]);

        SystemNotifier::toUser(
            $deletionRequest->requester_id,
            'deletion_rejected',
            'Penghapusan ditolak',
            "Permintaan penghapusan {$deletionRequest->subject_label} ditolak. Alasan: {$data['reviewer_note']}",
            '/notifications',
            ['deletion_request_id' => $deletionRequest->id],
        );

        return back()->with('success', 'Permintaan penghapusan telah ditolak.');
    }

    private function subject(DeletionRequest $deletionRequest): ?Model
    {
        return match ($deletionRequest->subject_type) {
            'pasien' => Pasien::find($deletionRequest->subject_id),
            'transaksi' => Transaksi::find($deletionRequest->subject_id),
            default => null,
        };
    }

    private function modelClass(string $subjectType): string
    {
        return match ($subjectType) {
            'pasien' => Pasien::class,
            'transaksi' => Transaksi::class,
            default => DeletionRequest::class,
        };
    }

    private function cancelMissingSubject(DeletionRequest $deletionRequest): void
    {
        $deletionRequest->update([
            'status' => DeletionRequest::CANCELLED,
            'reviewer_id' => auth()->id(),
            'reviewer_note' => 'Data asal sudah tidak tersedia saat ditinjau.',
            'reviewed_at' => now(),
        ]);

        SystemNotifier::toUser(
            $deletionRequest->requester_id,
            'deletion_cancelled',
            'Permintaan penghapusan dibatalkan',
            "Permintaan {$deletionRequest->subject_label} dibatalkan karena data sudah tidak tersedia.",
            '/notifications',
            ['deletion_request_id' => $deletionRequest->id],
        );
    }
}
