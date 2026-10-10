import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { authApi } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

interface GoogleIdApi {
  initialize: (config: object) => void;
  renderButton: (el: HTMLElement, config: object) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';

function loadGis(): Promise<GoogleIdApi> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => (window.google ? resolve(window.google.accounts.id) : reject()));
    script.addEventListener('error', () => reject());
  });
}

interface GoogleSignInButtonProps {
  onSuccess: (user: User) => void;
  text?: 'continue_with' | 'signup_with' | 'signin_with';
}

/** "Continue with Google" via Google Identity Services. Renders nothing when
 * the store hasn't configured a Google client ID. */
export function GoogleSignInButton({ onSuccess, text = 'continue_with' }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { data } = useQuery({
    queryKey: ['auth-providers'],
    queryFn: authApi.providers,
    enabled: !envClientId,
    staleTime: Infinity,
  });
  const clientId = envClientId || data?.google_client_id;

  // Keep the latest callbacks without re-initialising Google on every render.
  const handlers = useRef({ loginWithGoogle, onSuccess });
  handlers.current = { loginWithGoogle, onSuccess };

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGis()
      .then((gis) => {
        if (cancelled || !containerRef.current) return;
        gis.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: async ({ credential }: { credential: string }) => {
            setBusy(true);
            setError('');
            try {
              handlers.current.onSuccess(await handlers.current.loginWithGoogle(credential));
            } catch (err) {
              setError(getApiErrorMessage(err));
            } finally {
              setBusy(false);
            }
          },
        });
        gis.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          logo_alignment: 'center',
          width: Math.min(containerRef.current.offsetWidth || 360, 400),
        });
      })
      .catch(() => !cancelled && setError('Google sign-in could not load. Check your connection and try again.'));
    return () => {
      cancelled = true;
    };
  }, [clientId, text]);

  if (!clientId) return null;

  return (
    <div>
      <div className="relative my-6 flex items-center gap-4" role="separator">
        <span className="h-px flex-1 bg-navy/10" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-soft/60">or</span>
        <span className="h-px flex-1 bg-navy/10" />
      </div>
      {busy && (
        <div className="flex h-11 items-center justify-center gap-2 rounded-full border border-navy/15 text-sm font-medium text-navy-soft">
          <Loader2 className="h-4 w-4 animate-spin" /> Signing in with Google…
        </div>
      )}
      {/* Stays mounted while busy — Google renders its button into this node once. */}
      <div ref={containerRef} className={busy ? 'hidden' : 'flex min-h-[44px] w-full justify-center'} />

      {error && <p className="mt-2 text-center text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
