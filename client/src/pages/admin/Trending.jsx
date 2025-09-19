import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Trending = () => {
  const { axios, getToken } = useAppContext();
  const [selectedShowIds, setSelectedShowIds] = useState([]);
  const [allShows, setAllShows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch active shows (admin endpoint returns upcoming shows with movie populated)
  useEffect(() => {
    const load = async () => {
      try {
        const [trendRes, showsRes] = await Promise.all([
          axios.get('/api/admin/trending', { headers: { Authorization: `Bearer ${await getToken()}` } }),
          axios.get('/api/admin/all-shows', { headers: { Authorization: `Bearer ${await getToken()}` } }),
        ]);
        if (trendRes.data?.success) setSelectedShowIds(trendRes.data.showIds || []);
        if (showsRes.data?.success) setAllShows(showsRes.data.shows || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [axios, getToken]);

  const shows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (allShows || []).map(s => ({
      _id: s._id,
      movieTitle: s.movie?.title || 'Untitled',
      poster_path: s.movie?.poster_path,
      when: new Date(s.showDateTime),
    }));
    const filtered = q
      ? list.filter(s => s.movieTitle.toLowerCase().includes(q))
      : list;
    return filtered.sort((a,b) => a.movieTitle.localeCompare(b.movieTitle));
  }, [allShows, query]);

  const toggle = (id) => {
    setSelectedShowIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const save = async () => {
    try {
      setSaving(true);
      const { data } = await axios.post('/api/admin/trending', { showIds: selectedShowIds }, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) toast.success('Trending list saved');
      else toast.error(data.message || 'Failed to save');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className='p-6 text-gray-300'>Loading...</div>;

  return (
    <div className='p-6 md:p-10'>
      <h1 className='text-2xl font-semibold mb-4'>Curate Trending Now</h1>
      <p className='text-gray-400 mb-6'>Select active shows to display as Trending on the client dashboard. Order is the selection order.</p>

      <div className='mb-4 flex items-center gap-3'>
        <input
          type='text'
          placeholder='Search by movie title...'
          className='bg-transparent border border-gray-600 rounded px-3 py-2 w-full max-w-md'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button onClick={save} disabled={saving} className='bg-primary/80 hover:bg-primary text-white px-4 py-2 rounded disabled:opacity-50'>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {shows.map(s => (
          <label key={s._id} className={`border rounded p-3 flex items-center gap-3 cursor-pointer ${selectedShowIds.includes(s._id) ? 'border-primary' : 'border-gray-700'}`}>
            <input
              type='checkbox'
              className='accent-primary'
              checked={selectedShowIds.includes(s._id)}
              onChange={() => toggle(s._id)}
            />
            <div className='flex items-center gap-3'>
              {s.poster_path && (
                <img alt={s.movieTitle} src={`https://image.tmdb.org/t/p/w92${s.poster_path}`} className='w-10 h-14 object-cover rounded' />
              )}
              <div>
                <div className='font-medium'>{s.movieTitle}</div>
                <div className='text-xs text-gray-400'>{s.when.toLocaleString()}</div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Trending;
