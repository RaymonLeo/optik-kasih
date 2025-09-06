<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PatientExam extends Model {
  protected $fillable = ['patient_id','tanggal','rx'];
  protected $casts = ['rx' => 'array', 'tanggal' => 'date'];
  public function patient(){ return $this->belongsTo(Pasien::class, 'patient_id'); }
}