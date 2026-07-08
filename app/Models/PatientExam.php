<?php

// appV1.0 Rev 1 - Format cast tanggal jadi Y-m-d supaya JSON tidak keluar sebagai ISO datetime mentah.

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PatientExam extends Model {
  protected $fillable = ['patient_id','tanggal','rx'];
  protected $casts = ['rx' => 'array', 'tanggal' => 'date:Y-m-d'];
  public function patient(){ return $this->belongsTo(Pasien::class, 'patient_id'); }
}