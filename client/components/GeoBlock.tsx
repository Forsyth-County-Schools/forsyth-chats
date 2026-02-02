'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

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

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    try {
      // Try primary API: ipapi.co
      let response = await fetch('https://ipapi.co/json/');
      let data = await response.json();
      
      // If primary fails, try backup API: ipwho.is
      if (!response.ok || !data.country) {
        response = await fetch('https://ipwho.is/');
        data = await response.json();
        // Map ipwho.is response format
        data = {
          country: data.country,
          region: data.region,
          city: data.city,
        };
      }

      setLocationInfo(data);
      
      // Check if user is in Georgia, USA
      const isInGeorgia = data.country === 'US' && 
                         (data.region === 'Georgia' || data.region === 'GA');
      
      if (isInGeorgia) {
        onLocationVerified();
      } else {
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Geo-location check failed:', error);
      // FALLBACK: Allow access if API fails (conservative approach)
      // For production: Consider blocking conservatively by changing to setIsBlocked(true)
      onLocationVerified();
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--background)'}}>
        <Card className="card-modern p-12 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
            Verifying Access...
          </h2>
          <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
            Checking your location for security purposes
          </p>
        </Card>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: '#FFFFFF'}}>
        <div className="max-w-2xl mx-auto text-center">
          {/* Forsyth County Schools Logo Area */}
          <div className="mb-8">
            <div className="bg-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-black">FCS</span>
            </div>
            <h1 className="text-4xl font-black text-red-600 mb-2">
              ACCESS RESTRICTED
            </h1>
            <div className="h-1 w-32 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              This classroom chat is restricted to<br />
              Forsyth County Schools users in Georgia, USA only.
            </h2>
            <p className="text-lg text-red-700 mb-6">
              We detected you are accessing from outside of Georgia, United States.
              This educational platform is exclusively available to students, teachers, and staff
              within Forsyth County Schools district.
            </p>
            
            {locationInfo && (
              <div className="text-sm text-red-600 bg-white rounded-lg p-4 border border-red-200">
                <p><strong>Detected Location:</strong> {locationInfo.city}, {locationInfo.region}, {locationInfo.country}</p>
                <p className="mt-2 text-xs">If this is incorrect and you are in Georgia, please contact your IT administrator.</p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Forsyth County Schools</strong> • Cumming, Georgia
            </p>
            <p>
              For technical support, contact your school's IT department.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}