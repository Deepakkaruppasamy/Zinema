import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const StarInput = ({ value, setValue }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <button key={i} onClick={() => setValue(i)} className={`p-1 ${i <= value ? 'text-primary' : 'text-gray-500'}`}
        aria-label={`Rate ${i} stars`}>
        <Star className={`w-5 h-5 ${i <= value ? 'fill-primary' : ''}`} />
      </button>
    ))}
  </div>
);

const ReviewsSection = ({ movieId, user, axios, getToken, initialReviews = [] }) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/review/${movieId}`);
      if (data.success) setReviews(data.reviews || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) return toast.error('Please login to review');
      if (!text.trim() || rating === 0) return toast.error('Add text and rating');
      setSubmitting(true);
      const payload = { movieId, text, rating };
      const { data } = await axios.post('/api/review', payload, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) {
        // Refresh from server to avoid duplicates and keep ordering
        await fetchReviews();
        setText('');
        setRating(0);
        toast.success('Review added');
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditText(r.text);
    setEditRating(r.rating);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditRating(0);
  };

  const submitEdit = async () => {
    try {
      if (!user) return toast.error('Please login');
      if (!editText.trim() || editRating === 0) return toast.error('Add text and rating');
      setSubmitting(true);
      const { data } = await axios.put(`/api/review/${editingId}`, { text: editText, rating: editRating }, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) {
        await fetchReviews();
        cancelEdit();
        toast.success('Review updated');
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (id) => {
    try {
      if (!user) return toast.error('Please login');
      setSubmitting(true);
      const { data } = await axios.delete(`/api/review/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) {
        await fetchReviews();
        toast.success('Review deleted');
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  // Derive current user's review, if any
  const myReview = useMemo(() => {
    if (!user) return null;
    return reviews.find(r => r.user === user.id) || null;
  }, [reviews, user]);

  // Rating distribution 1..5
  const dist = useMemo(() => {
    const d = {1:0,2:0,3:0,4:0,5:0};
    reviews.forEach(r => { const k = String(r.rating); if (d[k] !== undefined) d[k]++; });
    return d;
  }, [reviews]);

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Reviews</h2>
        <span className="text-sm text-gray-400">Avg {avg} • {reviews.length} reviews</span>
      </div>

      {!myReview ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <StarInput value={rating} setValue={setRating} />
            <input
              value={text}
              onChange={(e)=>setText(e.target.value)}
              placeholder="Share your thoughts about the movie..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:border-primary"
            />
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary rounded-md hover:bg-primary-dull active:scale-95 disabled:opacity-60">{submitting ? 'Posting…' : 'Post'}</button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-300">You already reviewed this movie</p>
            <button onClick={()=>startEdit(myReview)} className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/15">Edit my review</button>
          </div>
          <div className="text-gray-200 text-sm">“{myReview.text}” • {myReview.rating}★</div>
        </div>
      )}

      {/* Rating distribution */}
      {reviews.length > 0 && (
        <div className="mt-4 space-y-1">
          {[5,4,3,2,1].map(star => {
            const count = dist[star];
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-6 text-right">{star}★</span>
                <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                  <div className="h-2 bg-primary" style={{ width: pct + '%' }} />
                </div>
                <span className="w-10">{pct}%</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading reviews…</p>
        ) : reviews.map((r) => (
          <div key={r._id} className="rounded-lg border border-white/10 p-4 bg-white/5">
            {editingId === r._id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-primary fill-primary"/> Edit your review
                </div>
                <div className="flex items-center gap-3">
                  <StarInput value={editRating} setValue={setEditRating} />
                  <input
                    value={editText}
                    onChange={(e)=>setEditText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={submitEdit} className="px-3 py-1.5 bg-primary rounded-md text-black font-semibold">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 bg-white/10 rounded-md">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Star className="w-4 h-4 text-primary fill-primary"/> {r.rating} • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  {user?.id === r.user && (
                    <div className="flex gap-2 text-xs">
                      <button onClick={()=>startEdit(r)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15">Edit</button>
                      <button onClick={()=>deleteReview(r._id)} className="px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30">Delete</button>
                    </div>
                  )}
                </div>
                <p className="text-gray-200 mt-1">{r.text}</p>
              </>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to share your thoughts.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
