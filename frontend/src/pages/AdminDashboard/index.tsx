import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import { getAdminStats, getAlumniByCohort, getRegistrationTrends } from '../../api/reports';
import { getAllUsers } from '../../api/users';
import { generateInvite } from '../../api/invite';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalAlumni: number;
  activeUsers: number;
  inactiveUsers: number;
  totalEvents: number;
  totalNotices: number;
  pendingApprovals?: number;
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
}

const COLORS = ['#003049', '#C1121F', '#F5F1E8', '#1A1A1A'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserItem[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Safety check: redirect non-admin users (ProtectedRoute should handle this, but double-check)
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [statsData, cohort, trends, users] = await Promise.all([
        getAdminStats(),
        getAlumniByCohort(),
        getRegistrationTrends(),
        getAllUsers()
      ]);
      
      setStats(statsData);
      setCohortData(cohort);
      setTrendData(trends);
      
      // Filter pending users (inactive users who need approval)
      const pending = users.filter((u: UserItem) => !u.active);
      setPendingUsers(pending.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateInviteLink() {
    setInviteLoading(true);
    try {
      const data = await generateInvite();
      const fullLink = `${window.location.origin}/register?token=${data.token || data.link}`;
      setInviteLink(fullLink);
    } catch (err: any) {
      alert(err.message || 'Failed to generate invite link');
    } finally {
      setInviteLoading(false);
    }
  }

  function copyInviteLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acces-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const userStatusData = stats ? [
    { name: 'Active', value: stats.activeUsers, color: '#003049' },
    { name: 'Inactive', value: stats.inactiveUsers, color: '#C1121F' }
  ] : [];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-acces-black mb-2">
              Administrator Dashboard
            </h1>
            <p className="text-lg text-gray-600">Manage alumni, events, and community engagement</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">🎓</div>
              <div className="text-2xl font-bold text-acces-black">{stats?.totalAlumni || 0}</div>
              <div className="text-sm text-gray-600">Total Alumni</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-acces-red">{pendingUsers.length}</div>
              <div className="text-sm text-gray-600">Pending Approvals</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-acces-blue">{stats?.totalEvents || 0}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">📢</div>
              <div className="text-2xl font-bold text-acces-red">{stats?.totalNotices || 0}</div>
              <div className="text-sm text-gray-600">Total Notices</div>
            </div>
          </div>

          {/* Quick Actions & Pending Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Pending Approvals */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-acces-black flex items-center gap-2">
                  <span>⏳</span> Pending Approvals
                </h2>
                <Link 
                  to="/admin/users" 
                  className="text-acces-blue hover:text-acces-red font-medium text-sm"
                >
                  Manage All →
                </Link>
              </div>
              {pendingUsers.length > 0 ? (
                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="p-4 bg-acces-beige rounded-lg border border-acces-black/20 hover:border-acces-blue transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-acces-black">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/users')}
                          className="px-4 py-2 bg-acces-blue text-white rounded-lg hover:bg-acces-red transition-colors text-sm font-medium"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending approvals</p>
                </div>
              )}
            </div>

            {/* Invite Link Generator */}
            <div className="bg-gradient-to-br from-acces-blue to-acces-red text-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔗</span> Registration Link
              </h2>
              {!inviteLink ? (
                <button
                  onClick={generateInviteLink}
                  disabled={inviteLoading}
                  className="w-full px-4 py-3 bg-white text-acces-blue rounded-lg font-semibold hover:bg-acces-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                    <p className="text-xs mb-2 opacity-90">Share this link:</p>
                    <p className="text-sm break-all font-mono">{inviteLink}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyInviteLink}
                      className="flex-1 px-4 py-2 bg-white text-acces-blue rounded-lg font-semibold hover:bg-acces-beige transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => setInviteLink(null)}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      New
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Alumni by Cohort */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <h2 className="text-xl font-bold text-acces-black mb-4">Alumni by Cohort</h2>
              {cohortData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#003049" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* User Status Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <h2 className="text-xl font-bold text-acces-black mb-4">User Status</h2>
              {userStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Registration Trends */}
          {trendData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black mb-8">
              <h2 className="text-xl font-bold text-acces-black mb-4">Registration Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#C1121F" 
                    strokeWidth={2}
                    name="Registrations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Access Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
            <h2 className="text-2xl font-bold text-acces-black mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/notices"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">📢</div>
                <div className="font-semibold">Manage Notices</div>
              </Link>

              <Link
                to="/admin/events"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">📅</div>
                <div className="font-semibold">Manage Events</div>
              </Link>

              <Link
                to="/admin/users"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="font-semibold">User Management</div>
              </Link>

              <Link
                to="/admin/alumni"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">🎓</div>
                <div className="font-semibold">Alumni Profiles</div>
              </Link>

              <Link
                to="/admin/reports"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold">Reports & Analytics</div>
              </Link>

              <Link
                to="/chat"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">💬</div>
                <div className="font-semibold">Chat</div>
              </Link>

              <Link
                to="/invite"
                className="p-6 bg-acces-beige border-2 border-acces-black rounded-lg hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="text-3xl mb-2">🔗</div>
                <div className="font-semibold">Invite Management</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
