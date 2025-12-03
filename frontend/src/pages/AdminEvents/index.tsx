import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../utils/request';
import Header from '../../components/layout/Header';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  posterPath?: string | null;
  createdAt: string;
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    date: '',
    venue: '',
    description: ''
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await request('/api/events', { method: 'GET' });
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  }

  function update(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('venue', form.venue);
      if (posterFile) {
        formData.append('poster', posterFile);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = editingId 
        ? `${API_BASE_URL}/api/events/${editingId}`
        : `${API_BASE_URL}/api/events`;

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to save event');
      }

      setForm({ title: '', date: '', venue: '', description: '' });
      setPosterFile(null);
      setPosterPreview(null);
      setEditingId(null);
      setSuccess(true);
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(event: Event) {
    setEditingId(event.id);
    const dateStr = new Date(event.date).toISOString().slice(0, 16);
    setForm({
      title: event.title,
      date: dateStr,
      venue: event.venue,
      description: event.description
    });
    setPosterFile(null);
    setPosterPreview(event.posterPath || null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: '', date: '', venue: '', description: '' });
    setPosterFile(null);
    setPosterPreview(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PNG, JPG, or PDF files only.');
        return;
      }
      
      setPosterFile(file);
      setError('');
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPosterPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF, just show a placeholder
        setPosterPreview(null);
      }
    }
  }

  function getPosterUrl(posterPath: string | null | undefined): string | null {
    if (!posterPath) return null;
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${API_BASE_URL}/uploads/${posterPath}`;
  }

  async function deleteEvent(id: string) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await request(`/api/events/${id}`, { method: 'DELETE' });
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-acces-black">Manage Events</h1>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black mb-8">
            <h2 className="text-2xl font-bold text-acces-black mb-4">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
                  placeholder="Enter event title..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => update('venue', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
                  placeholder="Enter venue location..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue resize-y"
                  placeholder="Enter event description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-acces-black mb-2">
                  Event Poster (PNG, JPG, or PDF)
                </label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
                />
                {(posterPreview || posterFile) && (
                  <div className="mt-4">
                    {posterFile ? (
                      posterFile.type.startsWith('image/') ? (
                        <img
                          src={posterPreview || ''}
                          alt="Poster preview"
                          className="max-w-xs max-h-48 object-contain border-2 border-acces-black rounded-lg"
                        />
                      ) : (
                        <div className="max-w-xs p-4 bg-gray-100 border-2 border-acces-black rounded-lg">
                          <p className="text-sm text-gray-600">PDF file selected: {posterFile.name}</p>
                        </div>
                      )
                    ) : posterPreview ? (
                      posterPreview.startsWith('data:') || posterPreview.startsWith('http') ? (
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="max-w-xs max-h-48 object-contain border-2 border-acces-black rounded-lg"
                        />
                      ) : (
                        <img
                          src={getPosterUrl(posterPreview) || ''}
                          alt="Poster preview"
                          className="max-w-xs max-h-48 object-contain border-2 border-acces-black rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (posterPreview.endsWith('.pdf')) {
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.pdf-placeholder')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'pdf-placeholder p-4 bg-gray-100 border-2 border-acces-black rounded-lg';
                                placeholder.innerHTML = `<p class="text-sm text-gray-600">📄 PDF Poster: <a href="${getPosterUrl(posterPreview)}" target="_blank" class="text-acces-blue underline">View PDF</a></p>`;
                                parent.appendChild(placeholder);
                              }
                            }
                          }}
                        />
                      )
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-acces-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? '💾 Update Event' : '📅 Create Event')}
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
                  Event created successfully!
                </div>
              )}
            </form>
          </div>

          {/* Existing Events */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
            <h2 className="text-2xl font-bold text-acces-black mb-4">Published Events</h2>
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No events created yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-6 bg-acces-beige rounded-lg border-2 border-acces-black/20 hover:border-acces-blue transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-acces-black">{ev.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(ev)}
                          className="px-3 py-1 bg-acces-blue text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap leading-relaxed">{ev.description}</p>
                    {ev.posterPath && (
                      <div className="mb-3">
                        <img
                          src={getPosterUrl(ev.posterPath) || ''}
                          alt={`${ev.title} poster`}
                          className="max-w-full max-h-64 object-contain border-2 border-acces-black rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (ev.posterPath?.endsWith('.pdf')) {
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.pdf-placeholder')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'pdf-placeholder p-4 bg-gray-100 border-2 border-acces-black rounded-lg';
                                placeholder.innerHTML = `<p class="text-sm text-gray-600">📄 PDF Poster: <a href="${getPosterUrl(ev.posterPath)}" target="_blank" class="text-acces-blue underline">View PDF</a></p>`;
                                parent.appendChild(placeholder);
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="text-sm text-acces-blue font-medium space-y-1">
                      <p>📅 Date: {new Date(ev.date).toLocaleString()}</p>
                      <p>📍 Venue: {ev.venue}</p>
                    </div>
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
