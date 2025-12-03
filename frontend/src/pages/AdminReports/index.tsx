import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { getAdminStats, getAlumniByCohort, getRegistrationTrends } from '../../api/reports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Stats {
  totalAlumni: number;
  activeUsers: number;
  inactiveUsers: number;
  totalEvents: number;
  totalNotices: number;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [s, c, t] = await Promise.all([
        getAdminStats(),
        getAlumniByCohort(),
        getRegistrationTrends()
      ]);
      setStats(s);
      setCohortData(c);
      setTrendData(t);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acces-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </>
    );
  }

  if (!stats) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
            <h1 className="text-3xl sm:text-4xl font-bold text-acces-black">Reports & Analytics</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors shadow-md hover:shadow-lg"
              >
                🖨️ Print Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">🎓</div>
              <div className="text-3xl font-bold text-acces-black">{stats.totalAlumni}</div>
              <div className="text-sm text-gray-600">Total Alumni</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">⏸️</div>
              <div className="text-3xl font-bold text-acces-red">{stats.inactiveUsers}</div>
              <div className="text-sm text-gray-600">Inactive Users</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-3xl font-bold text-acces-blue">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="text-3xl mb-2">📢</div>
              <div className="text-3xl font-bold text-acces-red">{stats.totalNotices}</div>
              <div className="text-sm text-gray-600">Total Notices</div>
            </div>
          </div>

          {/* Alumni by Cohort */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black mb-6">
              <h2 className="text-2xl font-bold text-acces-black mb-4">Alumni by Cohort</h2>
              {cohortData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-acces-black text-acces-beige">
                        <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Cohort</th>
                        <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.map((c, i) => (
                        <tr 
                          key={i} 
                          className={`${i % 2 === 0 ? 'bg-acces-beige' : 'bg-white'} hover:bg-acces-blue/10 transition-colors`}
                        >
                          <td className="px-6 py-4 border-b border-acces-black/20 font-semibold">
                            {c.cohort || 'N/A'}
                          </td>
                          <td className="px-6 py-4 border-b border-acces-black/20">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-acces-blue/10 text-acces-blue">
                              {c.count || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No cohort data available</p>
              )}
            </div>
            
            {cohortData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
                <h3 className="text-xl font-bold text-acces-black mb-4">Cohort Distribution Chart</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#003049" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Registration Trends */}
          {trendData.length > 0 && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black mb-6">
                <h2 className="text-2xl font-bold text-acces-black mb-4">Registration Trends</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-acces-black text-acces-beige">
                        <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Month</th>
                        <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Registrations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendData.map((t, i) => (
                        <tr 
                          key={i} 
                          className={`${i % 2 === 0 ? 'bg-acces-beige' : 'bg-white'} hover:bg-acces-blue/10 transition-colors`}
                        >
                          <td className="px-6 py-4 border-b border-acces-black/20 font-semibold">
                            {t.month || 'N/A'}
                          </td>
                          <td className="px-6 py-4 border-b border-acces-black/20">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-acces-red/10 text-acces-red">
                              {t.count || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
                <h3 className="text-xl font-bold text-acces-black mb-4">Registration Trends Chart</h3>
                <ResponsiveContainer width="100%" height={400}>
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
