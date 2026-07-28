import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Bookmark, Star, Settings, Calendar, BadgeCheck } from "lucide-react";
import { getMyBookings, createReview } from "../lib/api";

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function ReviewForm({ booking, token, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await createReview({ listing_id: booking.listing.id, booking_id: booking.id, rating, comment }, token);
      onSubmitted(booking.id);
    } catch (err) {
      setError(err.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 w-full">
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)}>
            <Star size={16} className={n <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
        placeholder="How was the service?"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary-400 resize-none" />
      <button onClick={submit} disabled={submitting}
        className="mt-2 w-full bg-primary-400 hover:bg-primary-600 text-white py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-60">
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}

export default function CustomerProfile() {
  const { user, token, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.name);
    getMyBookings(token).then(setBookings).catch(() => {});
  }, [user, token]);

  if (!user) { navigate("/login"); return null; }

  const handleSaveProfile = async () => {
    setSaveStatus("saving");
    try {
      await updateProfile({ name: displayName });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 capitalize">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 bg-primary-50 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full capitalize">{user.role}</span>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition">Sign out</button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bookings */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Calendar size={16} className="text-primary-400" /> My bookings</h2>
            {bookings.length === 0 && <p className="text-sm text-gray-400">No bookings yet.</p>}
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <img src={b.listing.image_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{b.listing.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{b.listing.provider_name}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(b.booking_date).toLocaleDateString()} · {b.time_slot}</div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                  {b.status === "completed" && !reviewedIds.includes(b.id) && (
                    <button onClick={() => setReviewingId(reviewingId === b.id ? null : b.id)}
                      className="text-xs text-primary-600 hover:text-primary-400 font-medium">Leave review</button>
                  )}
                  {reviewedIds.includes(b.id) && <span className="text-xs text-gray-400">Reviewed</span>}
                </div>
                {reviewingId === b.id && (
                  <ReviewForm booking={b} token={token} onSubmitted={(id) => { setReviewedIds(r => [...r, id]); setReviewingId(null); }} />
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2"><Settings size={14} /> Account</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Display name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email</label>
                  <input defaultValue={user.email} disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50 text-gray-400" />
                </div>
                <button onClick={handleSaveProfile}
                  className="w-full bg-primary-400 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-medium transition">
                  {saveStatus === "saving" ? "Saving…" : "Save changes"}
                </button>
                {saveStatus === "saved" && <p className="text-xs text-green-600 text-center">Saved!</p>}
                {saveStatus === "error" && <p className="text-xs text-red-600 text-center">Could not save.</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><BadgeCheck size={14} /> Notifications</h3>
              {["Email notifications", "Booking reminders", "AI suggestion updates"].map(n => (
                <label key={n} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-xs text-gray-600">{n}</span>
                  <input type="checkbox" defaultChecked className="accent-primary-400" />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
