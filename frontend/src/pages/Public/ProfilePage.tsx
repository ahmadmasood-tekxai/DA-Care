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
    <div className="min-h-screen bg-cream px-4 py-12 lg:py-24">
      <SEO title="My Profile — OQIRA" />

      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 shadow-xl shadow-gray-200/50">
          <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
            {user.profile_image ? (
              <img src={user.profile_image} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-[#C9A84C]" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C9A84C]/10 text-[#C9A84C]">
                <UserCircle className="h-10 w-10" />
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">{user.full_name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-[#C9A84C]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">
                {user.auth_provider === 'GOOGLE' ? 'Google Account' : 'Standard Account'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#C9A84C] focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/20"
              />
            </div>
            
            {user.auth_provider === 'LOCAL' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">New Password (Optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#C9A84C] focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/20"
                />
              </div>
            )}

            {error && <p className="text-sm text-rose-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600 font-medium">Profile updated successfully!</p>}

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0d0a0a] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1a1010] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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
