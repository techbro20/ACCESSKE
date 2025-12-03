import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/layout/Header';

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cohort: string;
  phone: string;
  profession: string;
  skills: string[];
}

interface ProfileFormData extends Profile {
  password?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }
    load();
  }, [user, navigate]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setP(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function save(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (!p) return;
    
    // Validate password if admin is changing it
    if (isAdmin && password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    setError('');
    setLoading(true);
    try {
      const updateData: any = {
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        profession: p.profession,
        skills: p.skills,
        cohort: p.cohort
      };
      
      // Only include password if admin provided one
      if (isAdmin && password && password.trim()) {
        updateData.password = password.trim();
      }
      
      await updateProfile(updateData);
      setEdit(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  const skillChips = useMemo(() => p?.skills?.filter(Boolean) ?? [], [p]);

  if (loading && !p) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!p && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Profile</h2>
        <p className="text-red-500">{error || 'Profile not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-5 py-2 rounded-lg bg-acces-blue text-white font-medium shadow hover:bg-acces-red transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500">My Profile</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Welcome back, {p!.firstName}
              </h1>
              <p className="text-gray-600 mt-1">{p!.profession || 'Alumni Member'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                className="px-4 py-2 rounded-lg bg-acces-blue text-white font-semibold shadow hover:bg-acces-red transition-colors"
              >
                ← Back to Dashboard
              </button>
              {edit ? (
                <>
                  <button
                    onClick={() => {
                      setEdit(false);
                      setPassword('');
                      setConfirmPassword('');
                      load();
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                <button
                  onClick={() => save()}
                    className="px-4 py-2 rounded-lg bg-acces-blue text-white font-semibold shadow hover:bg-acces-red transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEdit(true)}
                  className="px-4 py-2 rounded-lg bg-acces-blue text-white font-semibold shadow hover:bg-acces-red transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-acces-blue text-white flex items-center justify-center text-3xl font-bold">
                  {p!.firstName[0]}
                  {p!.lastName[0]}
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {p!.firstName} {p!.lastName}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="text-xl">📧</span> {p!.email}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="text-xl">📞</span> {p!.phone || 'Not provided'}
                  </p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acces-beige text-acces-black text-sm font-medium">
                    🎓 Cohort: {p!.cohort || 'Not set'}
                  </span>
                </div>
              </div>

              {edit && (
                <form onSubmit={save} className="mt-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">First Name</label>
                      <input
                        className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                        value={p!.firstName}
                        onChange={(e) => setP({ ...p!, firstName: e.target.value } as Profile)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Name</label>
                      <input
                        className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                        value={p!.lastName}
                        onChange={(e) => setP({ ...p!, lastName: e.target.value } as Profile)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <input
                        className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                        value={p!.phone}
                        onChange={(e) => setP({ ...p!, phone: e.target.value } as Profile)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Profession</label>
                      <input
                        className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                        value={p!.profession}
                        onChange={(e) => setP({ ...p!, profession: e.target.value } as Profile)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Skills (comma separated)</label>
                    <input
                      className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                      value={p!.skills.join(', ')}
                      onChange={(e) =>
                        setP({
                          ...p!,
                          skills: e.target.value
                            .split(',')
                            .map((x) => x.trim())
                            .filter(Boolean)
                        } as Profile)
                      }
                    />
                  </div>

                  {isAdmin && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">New Password</label>
                          <input
                            type="password"
                            className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password (leave empty to keep current)"
                          />
                        </div>
                        {password && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Confirm New Password</label>
                            <input
                              type="password"
                              className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-acces-blue focus:outline-none"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Details</h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex flex-col">
                    <dt className="text-gray-500">Status</dt>
                    <dd className="text-gray-900 font-medium">Active Member</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="text-gray-900 font-medium">{p!.email}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="text-gray-900 font-medium">{p!.phone || 'Not provided'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-gray-500">Cohort</dt>
                    <dd className="text-gray-900 font-medium">{p!.cohort || 'Not set'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
                {skillChips.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillChips.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-acces-blue/10 text-acces-blue text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Add skills to showcase your expertise.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
