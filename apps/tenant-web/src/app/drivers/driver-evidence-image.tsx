'use client';

import { type ReactNode, useState } from 'react';

export function DriverEvidenceImage({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null;
  alt: string;
  className: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <>{fallback}</>;
  }

  return <img alt={alt} className={className} onError={() => setFailed(true)} src={src} />;
}
