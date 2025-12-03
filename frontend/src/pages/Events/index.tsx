import { useEffect, useState } from 'react';
import { getEvents } from '../../api/events';
import Header from '../../components/layout/Header';

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  posterPath?: string | null;
}

export default function Events() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function getPosterUrl(posterPath: string | null | undefined): string | null {
    if (!posterPath) return null;
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${API_BASE_URL}/uploads/${posterPath}`;
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getEvents();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-acces-black mb-8">Events</h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading events...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {items.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg">No events available.</p>
          </div>
        )}

        <div className="space-y-6 mt-8">
          {items.map((ev) => (
            <div
              key={ev.id}
              className="bg-acces-beige border-2 border-acces-black p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-2xl font-bold mb-3 text-acces-black">{ev.title}</h3>
              {ev.posterPath && (
                <div className="mb-4">
                  {ev.posterPath.endsWith('.pdf') ? (
                    <div className="p-4 bg-gray-100 border-2 border-acces-black rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">📄 Event Poster (PDF)</p>
                      <a
                        href={getPosterUrl(ev.posterPath) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-acces-blue underline hover:text-acces-red"
                      >
                        View PDF Poster
                      </a>
                    </div>
                  ) : (
                    <img
                      src={getPosterUrl(ev.posterPath) || ''}
                      alt={`${ev.title} poster`}
                      className="w-full max-h-96 object-contain border-2 border-acces-black rounded-lg mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}
              <p className="text-gray-700 mb-4 leading-relaxed">{ev.description}</p>
              <div className="space-y-2 pt-4 border-t border-acces-black/20">
                <p className="text-sm">
                  <strong className="text-acces-blue">Date:</strong>{' '}
                  <span className="text-gray-700">{new Date(ev.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-acces-blue">Venue:</strong>{' '}
                  <span className="text-gray-700">{ev.venue}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
