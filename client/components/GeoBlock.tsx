'use client';

import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  country: string;
  region?: string;
  city?: string;
}

interface GeoBlockProps {
  onLocationVerified: () => void;
}

export default function GeoBlock({ onLocationVerified }: GeoBlockProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationData | null>(null);

  const checkLocation = useCallback(async () => {
    try {
      // Check if we're on allowed domains first (skip geo-check for trusted deployments)
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        'forsyth-chats.vercel.app',
        'forsyth-chats.onrender.com'
      ];
      
      if (allowedDomains.includes(currentDomain)) {
        setIsChecking(false);
        onLocationVerified();
        return;
      }

      // Get user's location
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      
      const data = await response.json();
      const locationData: LocationData = {
        country: data.country,
        region: data.region,
        city: data.city,
      };
      
      setLocationInfo(locationData);
      
      // Check if user is in Georgia
      if (data.country !== 'US' || data.region !== 'GA') {
        setIsBlocked(true);
      } else {
        setIsChecking(false);
        onLocationVerified();
      }
    } catch (error) {
      console.error('Error checking location:', error);
      setIsBlocked(true);
    } finally {
      setIsChecking(false);
    }
  }, [onLocationVerified]);

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.01)_25%,rgba(59,130,246,0.01)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.01)_75%)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-slate-900/50" />
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-red-600 mx-auto"></div>
            <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">
            Verifying Access...
          </h2>
          <p className="text-lg text-gray-400">
            Checking Georgia location requirements for Forsyth County Schools
          </p>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.01)_25%,rgba(239,68,68,0.01)_50%,transparent_50%,transparent_75%,rgba(239,68,68,0.01)_75%)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-slate-900/50" />
        <div className="max-w-2xl mx-auto text-center">
          {/* Forsyth County Schools Logo Area */}
          <div className="mb-8">
            <div className="bg-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
              <span className="text-white text-2xl font-black">FCS</span>
              <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-black text-red-500 mb-2">
              ACCESS RESTRICTED
            </h1>
            <div className="h-1 w-32 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="bg-gray-900/80 border-2 border-red-600/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              This classroom chat is restricted to<br />
              Forsyth County Schools users in Georgia, USA only.
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              We detected you are accessing from outside of Georgia, United States.
              This educational platform is exclusively available to students
              within Forsyth County Schools district.
            </p>
            
            {locationInfo && (
              <div className="text-sm text-red-400 bg-gray-800/50 rounded-lg p-4 border border-red-600/30 backdrop-blur-sm">
                <p><strong>Detected Location:</strong> {locationInfo.city}, {locationInfo.region}, {locationInfo.country}</p>
                <p className="mt-2 text-xs text-gray-400">If this is incorrect and you are in Georgia, please contact your IT administrator.</p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p className="mb-2">
              <strong className="text-red-400">Forsyth County Schools</strong> • Cumming, Georgia
            </p>
            <p>
              For technical support, contact your school&apos;s IT department.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
