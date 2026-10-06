import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/api/client';
import { ROUTES, GOOGLE_CLIENT_ID } from '@/constants';
import type { TokenResponse } from '@/types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  /** Width of the rendered Google button in px */
  width?: number;
}

export function GoogleSignInButton({ width = 360 }: GoogleSignInButtonProps) {
  const { oauthLogin } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        context: 'signin',
        ux_mode: 'popup',
        auto_prompt: false,
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'pill',
        width: width,
      });
    };

    // Check if GIS script is already loaded
    if (window.google) {
      initGoogle();
      return;
    }

    // Load the GIS script dynamically
    const existing = document.getElementById('google-gis-script');
    if (existing) {
      existing.addEventListener('load', initGoogle);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, []);

  const handleGoogleCredential = async (response: { credential: string }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post<TokenResponse>('/auth/google/verify', {
        id_token: response.credential,
      });
      oauthLogin(data.access_token, data.user);
      navigate(ROUTES.HOME);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing in with Google…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* GIS renders its own button inside this div */}
      <div ref={containerRef} className="flex justify-center" />
      {error && (
        <p className="text-center text-xs text-rose-500">{error}</p>
      )}
    </div>
  );
}
