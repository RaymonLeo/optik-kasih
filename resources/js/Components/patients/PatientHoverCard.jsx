import React from 'react';

export default function PatientHoverCard({ patient }) {
  if (!patient) return null;
  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-orange-200 bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">{patient.nama_pasien}</h4>
        <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
          {patient.kode_pasien || '—'}
        </span>
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Tanggal Buat</dt>
          <dd className="font-medium">{patient.tanggal_buat ?? '-'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">No. HP</dt>
          <dd className="font-medium">{patient.nohp_pasien ?? '-'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Tanggal Lahir</dt>
          <dd className="font-medium">{patient.tanggal_lahir ?? '-'}</dd>
        </div>
      </dl>
      <div className="mt-3 rounded-lg bg-orange-50 p-2 text-xs text-orange-700">
        {patient.alamat_pasien || 'Alamat belum diisi.'}
      </div>
    </div>
  );
}
