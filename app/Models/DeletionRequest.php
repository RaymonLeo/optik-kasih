<?php

// appV1.0 Rev 4 - Model persetujuan penghapusan data global.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeletionRequest extends Model
{
    public const PENDING = 'pending';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';
    public const CANCELLED = 'cancelled';

    protected $fillable = [
        'requester_id',
        'reviewer_id',
        'subject_type',
        'subject_id',
        'subject_label',
        'reason',
        'snapshot',
        'status',
        'reviewer_note',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
