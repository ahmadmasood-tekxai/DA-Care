import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import { AUTH_TOKEN_KEY } from '@/constants';
import { UserCircle, Save, Loader2 } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { useMutation } from '@tanstack/react-query';

export function ProfilePage() {
  const { user, oauthLogin } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: async (payload: { full_name?: string; password?: string }) => {
      return await authApi.updateMe(payload);
    },
    onSuccess: (updatedUser) => {
      setSuccess(true);
      setError('');
      setPassword('');
      // Update AuthContext seamlessly
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) oauthLogin(token, updatedUser);
      
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => {
      setError('Failed to update profile. Please try again.');
      setSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Name is required');
      return;
    }
    const payload: { full_name?: string; password?: string } = { full_name: fullName };
    if (password) payload.password = password;
    updateMutation.mutate(payload);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0d0a0a] px-4 py-12 lg:py-24">
      <SEO title="My Profile — OQIRA" />

      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-[#C9A84C]/15 bg-white/[0.04] backdrop-blur-xl p-8 sm:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
            {user.profile_image ? (
              <img src={user.profile_image} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-[#C9A84C]/50" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C9A84C] text-[#0d0a0a]">
                <UserCircle className="h-10 w-10" />
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{user.full_name}</h1>
              <p className="text-sm text-white/50">{user.email}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">
                {user.auth_provider === 'GOOGLE' ? 'Google Account' : 'Standard Account'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#C9A84C]/50 focus:bg-white/8 focus:ring-1 focus:ring-[#C9A84C]/30"
              />
            </div>
            
            {user.auth_provider === 'LOCAL' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">New Password (Optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#C9A84C]/50 focus:bg-white/8 focus:ring-1 focus:ring-[#C9A84C]/30"
                />
              </div>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}
            {success && <p className="text-sm text-emerald-400">Profile updated successfully!</p>}

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96D] to-[#C9A84C] bg-[length:200%_auto] py-4 text-sm font-extrabold uppercase tracking-widest text-[#0d0a0a] shadow-[0_8px_32px_rgba(201,168,76,0.4)] transition-all hover:shadow-[0_12px_40px_rgba(201,168,76,0.6)] hover:scale-[1.02] animate-[gradient_3s_linear_infinite] disabled:opacity-60"
            >
              {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
