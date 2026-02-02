'use client';

import { useState } from 'react';
import GeoBlock from './GeoBlock';

interface GeoBlockWrapperProps {
  children: React.ReactNode;
}

export default function GeoBlockWrapper({ children }: GeoBlockWrapperProps) {
  const [isLocationVerified, setIsLocationVerified] = useState(false);

  const handleLocationVerified = () => {
    setIsLocationVerified(true);
  };

  if (!isLocationVerified) {
    return <GeoBlock onLocationVerified={handleLocationVerified} />;
  }

  return <>{children}</>;
}