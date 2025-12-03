import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserStatus, deleteUser } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/layout/Header';

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function toggle(u: UserItem) {
    try {
      await updateUserStatus(u.id, !u.active);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  }

  async function handleDelete(u: UserItem) {
    if (!window.confirm(`Are you sure you want to permanently delete ${u.firstName} ${u.lastName}? This action cannot be undone and will remove all their data from the system.`)) {
      return;
    }
    
    try {
      await deleteUser(u.id);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
            <h1 className="text-3xl sm:text-4xl font-bold text-acces-black">User Management</h1>
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
              <p className="text-gray-600">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-lg">No users found.</p>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-acces-black overflow-hidden print:shadow-none print:border-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-acces-black text-acces-beige">
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Name</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Email</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black">Status</th>
                      <th className="px-6 py-4 text-left font-semibold border-b-2 border-acces-black print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr 
                        key={u.id} 
                        className={`${index % 2 === 0 ? 'bg-acces-beige' : 'bg-white'} hover:bg-acces-blue/10 transition-colors`}
                      >
                        <td className="px-6 py-4 border-b border-acces-black/20">
                          <div className="font-semibold text-acces-black">
                            {u.firstName} {u.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20 text-gray-700">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            u.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {u.active ? '✅ Active' : '⏳ Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-acces-black/20 print:hidden">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggle(u)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                u.active
                                  ? 'bg-acces-red text-white hover:bg-red-700'
                                  : 'bg-acces-blue text-white hover:bg-blue-700'
                              }`}
                            >
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={u.id === currentUser?.id}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                u.id === currentUser?.id
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                              title={u.id === currentUser?.id ? "You cannot delete your own account" : "Permanently delete user"}
                            >
                              🗑️ Delete
                            </button>
                          </div>
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
