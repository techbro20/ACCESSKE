import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlumniList, updateAlumni } from '../../api/alumni';
import { request } from '../../utils/request';
import Header from '../../components/layout/Header';

interface Alumni {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cohort: string | null;
  phone?: string;
  profession?: string;
  skills?: string[];
}

export default function AdminAlumni() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCohort, setEditingCohort] = useState<{ id: string; cohort: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAlumniList();
      setAlumni(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load alumni profiles');
    } finally {
      setLoading(false);
    }
  }

  function startEditCohort(alum: Alumni) {
    setEditingCohort({ id: alum.id, cohort: alum.cohort || '' });
  }

  function cancelEditCohort() {
    setEditingCohort(null);
  }

  async function saveCohort() {
    if (!editingCohort) return;
    try {
      await updateAlumni(editingCohort.id, { cohort: editingCohort.cohort || null });
      setEditingCohort(null);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to update cohort');
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
            <h1 className="text-3xl sm:text-4xl font-bold text-acces-black">Alumni Profiles</h1>
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
                🖨️ Print Table
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acces-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Loading alumni profiles...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!loading && alumni.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-lg">No alumni profiles found.</p>
            </div>
          )}

          {!loading && alumni.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-acces-black overflow-hidden print:shadow-none print:border-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-acces-black text-acces-beige">
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Name</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Email</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Cohort</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Phone</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Profession</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumni.map((a, index) => (
                      <tr 
                        key={a.id} 
                        className={`${index % 2 === 0 ? 'bg-acces-beige' : 'bg-white'} hover:bg-acces-blue/10 transition-colors`}
                      >
                        <td className="px-6 py-4 border-b border-acces-black/20">
                          <div className="font-semibold text-acces-black">
                            {a.firstName} {a.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20 text-gray-700">
                          {a.email}
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20">
                          {editingCohort?.id === a.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingCohort.cohort}
                                onChange={(e) => setEditingCohort({ ...editingCohort, cohort: e.target.value })}
                                className="px-2 py-1 border border-acces-black rounded text-sm w-32"
                                placeholder="Enter cohort"
                                autoFocus
                              />
                              <button
                                onClick={saveCohort}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEditCohort}
                                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-acces-blue/10 text-acces-blue">
                                {a.cohort || 'N/A'}
                              </span>
                              <button
                                onClick={() => startEditCohort(a)}
                                className="px-2 py-1 bg-acces-blue text-white rounded text-xs hover:bg-blue-600"
                                title="Edit cohort"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20 text-gray-700">
                          {a.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20 text-gray-700">
                          {a.profession || 'N/A'}
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20">
                          {a.skills && a.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {a.skills.slice(0, 3).map((skill, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-acces-beige border border-acces-black/20"
                                >
                                  {skill}
                                </span>
                              ))}
                              {a.skills.length > 3 && (
                                <span className="text-xs text-gray-500">+{a.skills.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
