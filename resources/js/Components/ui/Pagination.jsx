import React from 'react';
import { router } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
  if (!links.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {links.map((link, i) => {
        const isActive = link.active;
        const isDisabled = !link.url;

        const label = link.label
          .replace('&laquo; Previous', '«')
          .replace('Next &raquo;', '»');

        return (
          <button
            key={i}
            disabled={isDisabled}
            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
            className={`px-3 py-1.5 rounded-lg border text-sm
              ${isActive ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            dangerouslySetInnerHTML={{ __html: label }}
          />
        );
      })}
    </div>
  );
}
