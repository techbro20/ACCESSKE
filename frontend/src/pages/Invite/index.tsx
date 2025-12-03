import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInvite } from '../../api/invite';
import { searchAlumni } from '../../api/alumni';
import Header from '../../components/layout/Header';

interface Alumni {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cohort: string;
}

export default function InvitePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Alumni[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search() {
    if (query.trim().length === 0) return;
    setError('');
    setLoading(true);
    try {
      const data = await searchAlumni(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  async function createInvite() {
    setError('');
    setLoading(true);
    try {
      const data = await generateInvite();
      const fullLink = `${window.location.origin}/register?token=${data.token || data.link}`;
      setInviteLink(fullLink);
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Link copied to clipboard!');
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-acces-black">Invite Alumni</h1>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Generate Invite Link Section */}
          <div className="bg-gradient-to-br from-acces-blue to-acces-red text-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🔗</span> Generate Registration Link
            </h2>
            {!inviteLink ? (
              <button
                onClick={createInvite}
                disabled={loading}
                className="w-full px-6 py-4 bg-white text-acces-blue rounded-lg font-semibold hover:bg-acces-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Generating...' : 'Generate Invite Link'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <p className="text-sm mb-2 opacity-90">Share this registration link:</p>
                  <p className="text-sm break-all font-mono bg-white/10 p-2 rounded">{inviteLink}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 px-6 py-3 bg-white text-acces-blue rounded-lg font-semibold hover:bg-acces-beige transition-colors"
                  >
                    📋 Copy Link
                  </button>
                  <button
                    onClick={() => setInviteLink(null)}
                    className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    New Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Alumni Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black mb-8">
            <h2 className="text-2xl font-bold text-acces-black mb-4 flex items-center gap-2">
              <span>🔍</span> Search Alumni
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={query}
                placeholder="Search by name, email, or cohort..."
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && search()}
                className="flex-1 px-4 py-3 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
              />
              <button
                onClick={search}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <h2 className="text-xl font-bold text-acces-black mb-4">Search Results</h2>
              <div className="space-y-3">
                {results.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-acces-beige rounded-lg border-2 border-acces-black/20 hover:border-acces-blue transition-all"
                  >
                    <h3 className="font-semibold text-acces-black text-lg mb-1">
                      {a.firstName} {a.lastName}
                    </h3>
                    <p className="text-gray-700 mb-1">{a.email}</p>
                    <p className="text-sm text-acces-blue">
                      <span className="font-medium">Cohort:</span> {a.cohort}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
