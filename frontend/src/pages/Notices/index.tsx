import { useEffect, useState } from 'react';
import { getNotices } from '../../api/notices';
import Header from '../../components/layout/Header';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-acces-black mb-8">Notices</h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading notices...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="space-y-6 mt-8">
          {notices.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-lg">No notices available.</p>
            </div>
          )}
          {notices.map((n) => (
            <div
              key={n.id}
              className="border-2 border-acces-black p-6 bg-acces-beige rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold mb-3 mt-0 text-acces-black">{n.title}</h3>
              <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{n.content}</p>
              <small className="text-acces-blue font-medium">
                {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
