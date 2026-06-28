<?php

// appV1.0 Rev 4 - Pengelolaan foto carousel yang dipilih untuk tiap cabang.

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\BranchPhoto;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BranchGalleryController extends Controller
{
    public function own(): Response
    {
        return $this->page(auth()->user(), false);
    }

    public function show(User $admin): Response
    {
        abort_unless($admin->role === 'admin', 404);

        return $this->page($admin, true);
    }

    public function storeOwn(Request $request): RedirectResponse
    {
        return $this->store($request, auth()->user());
    }

    public function storeForAdmin(Request $request, User $admin): RedirectResponse
    {
        abort_unless($admin->role === 'admin', 404);

        return $this->store($request, $admin);
    }

    public function updateOwn(Request $request, BranchPhoto $branchPhoto): RedirectResponse
    {
        return $this->update($request, auth()->user(), $branchPhoto);
    }

    public function updateForAdmin(Request $request, User $admin, BranchPhoto $branchPhoto): RedirectResponse
    {
        abort_unless($admin->role === 'admin', 404);

        return $this->update($request, $admin, $branchPhoto);
    }

    public function destroyOwn(BranchPhoto $branchPhoto): RedirectResponse
    {
        return $this->destroy(auth()->user(), $branchPhoto);
    }

    public function destroyForAdmin(User $admin, BranchPhoto $branchPhoto): RedirectResponse
    {
        abort_unless($admin->role === 'admin', 404);

        return $this->destroy($admin, $branchPhoto);
    }

    private function page(User $admin, bool $isSuperAdminView): Response
    {
        return Inertia::render('Branch/Gallery', [
            'branch' => $admin->only([
                'id',
                'name',
                'branch_description',
                'branch_address',
                'branch_phone',
                'branch_operational_hours',
            ]),
            'photos' => $admin->branchPhotos()
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->latest()
                ->get()
                ->map(fn (BranchPhoto $photo) => [
                    'id' => $photo->id,
                    'url' => Storage::url($photo->path),
                    'caption' => $photo->caption,
                    'is_featured' => $photo->is_featured,
                    'sort_order' => $photo->sort_order,
                ]),
            'isSuperAdminView' => $isSuperAdminView,
        ]);
    }

    private function store(Request $request, User $admin): RedirectResponse
    {
        $data = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'caption' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:99'],
        ]);

        $this->ensureFeaturedSlot($admin, (bool) $data['is_featured']);

        $photo = $admin->branchPhotos()->create([
            'path' => $request->file('photo')->store('cabang', 'public'),
            'caption' => $data['caption'] ?? null,
            'is_featured' => $data['is_featured'],
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->log('create', $admin, $photo);

        return back()->with('success', 'Foto cabang berhasil ditambahkan.');
    }

    private function update(Request $request, User $admin, BranchPhoto $branchPhoto): RedirectResponse
    {
        $this->belongsToBranch($admin, $branchPhoto);

        $data = $request->validate([
            'caption' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:99'],
        ]);

        if (! $branchPhoto->is_featured && (bool) $data['is_featured']) {
            $this->ensureFeaturedSlot($admin, true);
        }

        $branchPhoto->update([
            'caption' => $data['caption'] ?? null,
            'is_featured' => $data['is_featured'],
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->log('update', $admin, $branchPhoto);

        return back()->with('success', 'Pengaturan foto cabang berhasil disimpan.');
    }

    private function destroy(User $admin, BranchPhoto $branchPhoto): RedirectResponse
    {
        $this->belongsToBranch($admin, $branchPhoto);

        Storage::disk('public')->delete($branchPhoto->path);
        $this->log('delete', $admin, $branchPhoto);
        $branchPhoto->delete();

        return back()->with('success', 'Foto cabang berhasil dihapus.');
    }

    private function ensureFeaturedSlot(User $admin, bool $willBeFeatured): void
    {
        if (! $willBeFeatured) {
            return;
        }

        abort_if(
            $admin->branchPhotos()->where('is_featured', true)->count() >= 3,
            422,
            'Carousel halaman utama hanya dapat menampilkan maksimal tiga foto.',
        );
    }

    private function belongsToBranch(User $admin, BranchPhoto $branchPhoto): void
    {
        abort_unless($branchPhoto->admin_id === $admin->id, 404);
    }

    private function log(string $action, User $admin, BranchPhoto $photo): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model' => BranchPhoto::class,
            'model_id' => $photo->id,
            'details' => [
                'cabang' => $admin->name,
                'photo_id' => $photo->id,
                'caption' => $photo->caption,
                'is_featured' => $photo->is_featured,
                'sort_order' => $photo->sort_order,
            ],
        ]);
    }
}
