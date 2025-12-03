import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../utils/request';
import Header from '../../components/layout/Header';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminNotices() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<Notice[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  async function load() {
    try {
      const data = await request('/api/notices', { method: 'GET' });
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notices');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      if (editingId) {
        await request(`/api/notices/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTitle, content: editContent })
        });
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
      } else {
        await request('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
        setTitle('');
        setContent('');
      }
      setSuccess(true);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to save notice');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(notice: Notice) {
    setEditingId(notice.id);
    setEditTitle(notice.title);
    setEditContent(notice.content);
    setTitle('');
    setContent('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  }

  async function deleteNotice(id: string) {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await request(`/api/notices/${id}`, { method: 'DELETE' });
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete notice');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-acces-black">Manage Notices</h1>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Create/Edit Notice Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black mb-8">
            <h2 className="text-2xl font-bold text-acces-black mb-4">
              {editingId ? 'Edit Notice' : 'Post New Notice'}
            </h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingId ? editTitle : title}
                  onChange={(e) => editingId ? setEditTitle(e.target.value) : setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
                  placeholder="Enter notice title..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Content
                </label>
                <textarea
                  value={editingId ? editContent : content}
                  onChange={(e) => editingId ? setEditContent(e.target.value) : setContent(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue resize-y"
                  placeholder="Enter notice content..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (editingId ? 'Updating...' : 'Publishing...') : (editingId ? '💾 Update Notice' : '📢 Publish Notice')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Notice published successfully!
                </div>
              )}
            </form>
          </div>

          {/* Existing Notices */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
            <h2 className="text-2xl font-bold text-acces-black mb-4">Published Notices</h2>
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No notices published yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className="p-6 bg-acces-beige rounded-lg border-2 border-acces-black/20 hover:border-acces-blue transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-acces-black">{n.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(n)}
                          className="px-3 py-1 bg-acces-blue text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteNotice(n.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                    <p className="text-sm text-acces-blue font-medium">
                      Published: {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export {};
