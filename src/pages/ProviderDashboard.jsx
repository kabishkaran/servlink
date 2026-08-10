import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Star, Eye, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Pause, Play, Trash2, X } from "lucide-react";
import { getMyProviderProfile, getMyListings, getProviderBookings, updateBookingStatus, createListing, updateListing, deleteListing } from "../lib/api";

const EMPTY_LISTING_FORM = { title: "", description: "", price: "", unit: "hour", location: "", image_url: "" };

function NewListingModal({ onClose, onCreated, token }) {
  const [form, setForm] = useState(EMPTY_LISTING_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const listing = await createListing({
        title: form.title,
        description: form.description,
        price: form.price === "" ? null : Number(form.price),
        unit: form.unit,
        location: form.location,
        image_url: form.image_url,
      }, token);
      onCreated(listing);
    } catch (err) {
      setError(err.message || "Could not create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">New listing</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100">{error}</div>}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
            <input required value={form.title} onChange={set("title")} placeholder="e.g. Emergency Callout Service"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={set("description")} placeholder="Describe what's included…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Price (Rs.)</label>
              <input type="number" min="0" value={form.price} onChange={set("price")} placeholder="2500"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Unit</label>
              <select value={form.unit} onChange={set("unit")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white">
                {["hour", "session", "day", "move", "setup", "month", "visit"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
            <input value={form.location} onChange={set("location")} placeholder="e.g. Colombo 5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Photo URL (optional)</label>
            <input value={form.image_url} onChange={set("image_url")} placeholder="https://…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-primary-400 hover:bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 mt-1">
            {submitting ? "Creating…" : "Create listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

const statusConfig = {
  pending:   { icon:<Clock size={12}/>,        label:"Pending",   cls:"bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { icon:<CheckCircle size={12}/>,  label:"Confirmed", cls:"bg-green-50 text-green-700 border-green-200" },
  completed: { icon:<Star size={12}/>,         label:"Completed", cls:"bg-blue-50 text-blue-700 border-blue-200" },
  cancelled: { icon:<XCircle size={12}/>,      label:"Cancelled", cls:"bg-red-50 text-red-600 border-red-200" },
};

export default function ProviderDashboard() {
  const { user, token, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showNewListing, setShowNewListing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    getMyProviderProfile(token).then(setProfile).catch(() => setProfileMissing(true));
    getMyListings(token).then(setListings).catch(() => {});
    getProviderBookings(token).then(setBookings).catch(() => {});
  }, [user, token, loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return null;

  if (profileMissing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <AlertTriangle size={28} className="text-amber-400 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-900 mb-2">No provider profile yet</h2>
          <p className="text-sm text-gray-500 mb-5">Complete your provider registration to access the dashboard.</p>
          <Link to="/provider/register" className="inline-block bg-primary-400 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
            Complete registration
          </Link>
        </div>
      </div>
    );
  }

  const setBookingLocally = (id, patch) => setBookings(bs => bs.map(b => b.id === id ? { ...b, ...patch } : b));

  const transition = async (id, status) => {
    try {
      await updateBookingStatus(id, status, token);
      setBookingLocally(id, { status });
    } catch {
      // leave the booking as-is; the button remains available to retry
    }
  };

  const toggleListingAvailable = async (l) => {
    try {
      const updated = await updateListing(l.id, { available: !l.available }, token);
      setListings(ls => ls.map(x => x.id === updated.id ? updated : x));
    } catch {
      // leave listing as-is
    }
  };

  const removeListing = async (l) => {
    if (!window.confirm(`Delete "${l.title}"? This can't be undone.`)) return;
    try {
      await deleteListing(l.id, token);
      setListings(ls => ls.filter(x => x.id !== l.id));
    } catch {
      // leave listing as-is
    }
  };

  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const avgRating = listings.length
    ? (listings.reduce((sum, l) => sum + l.rating * l.review_count, 0) / Math.max(1, listings.reduce((sum, l) => sum + l.review_count, 0))).toFixed(1)
    : "—";

  const stats = [
    { label:"Listing views",  value:totalViews,                                  icon:<Eye size={18} className="text-primary-400" /> },
    { label:"Bookings",       value:bookings.length,                             icon:<Calendar size={18} className="text-blue-500" /> },
    { label:"Completed",      value:bookings.filter(b=>b.status==="completed").length, icon:<CheckCircle size={18} className="text-green-500" /> },
    { label:"Avg. rating",    value:listings.length ? `${avgRating} ★` : "—",     icon:<Star size={18} className="text-amber-400" /> },
  ];

  const verificationBadge = {
    pending: { label: "Verification pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "Verified", cls: "bg-green-50 text-green-700 border-green-200" },
    rejected: { label: "Verification rejected", cls: "bg-red-50 text-red-600 border-red-200" },
  }[profile?.verification_status];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-dark text-white border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Provider Dashboard</h1>
            <p className="text-gray-400 text-xs mt-0.5">Welcome back, {profile?.business_name || user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {verificationBadge && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${verificationBadge.cls} bg-opacity-100`}>{verificationBadge.label}</span>
            )}
            <button onClick={() => { logout(); navigate("/"); }} className="text-xs text-gray-400 hover:text-white transition">Sign out</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {["overview","bookings","listings","analytics"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 ${activeTab === tab ? "text-white border-primary-400" : "text-gray-400 border-transparent hover:text-gray-200"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">{s.label}</span>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main content by tab */}
        {(activeTab === "overview" || activeTab === "bookings") && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Booking requests</h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                {bookings.filter(b=>b.status==="pending").length} pending
              </span>
            </div>
            {bookings.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">No bookings yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <div key={b.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                      {b.customer_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">{b.listing.title} · {new Date(b.booking_date).toLocaleDateString()} at {b.time_slot}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig[b.status].cls}`}>
                        {statusConfig[b.status].icon} {statusConfig[b.status].label}
                      </span>
                      {b.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => transition(b.id, "confirmed")}
                            className="bg-primary-400 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">Accept</button>
                          <button onClick={() => transition(b.id, "cancelled")}
                            className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition">Decline</button>
                        </div>
                      )}
                      {b.status === "confirmed" && (
                        <button onClick={() => transition(b.id, "completed")}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">Mark completed</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === "overview" || activeTab === "listings") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My listings</h2>
              <button onClick={() => setShowNewListing(true)}
                className="flex items-center gap-1.5 bg-primary-400 hover:bg-primary-600 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition">
                <Plus size={14} /> Add listing
              </button>
            </div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500 mb-3">No listings yet — customers can't find you until you add one.</p>
                <button onClick={() => setShowNewListing(true)}
                  className="inline-flex items-center gap-1.5 bg-primary-400 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                  <Plus size={14} /> Create your first listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map(l => (
                  <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                    <img src={l.image_url} alt="" className="w-20 h-20 object-cover flex-shrink-0 bg-gray-100" />
                    <div className="p-4 flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{l.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={10} /> {l.views} views</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Star size={10} className="text-amber-400" /> {l.rating || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold text-primary-600">Rs. {l.price?.toLocaleString()}/{l.unit}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.available ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {l.available ? "Active" : "Paused"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2 justify-center flex-shrink-0">
                      <button onClick={() => toggleListingAvailable(l)} title={l.available ? "Pause" : "Reactivate"}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-600 transition">
                        {l.available ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                      <button onClick={() => removeListing(l)} title="Delete"
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><BarChart3 size={16} className="text-primary-400" /> Performance analytics</h2>
            {listings.length === 0 ? (
              <p className="text-sm text-gray-400">No listings yet — analytics will appear once you have active listings.</p>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-4">Views by listing</p>
                <div className="flex items-end gap-3 h-32 mb-4">
                  {listings.map(l => (
                    <div key={l.id} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary-400 rounded-t-md transition-all" style={{ height: `${Math.max(4, (l.views / Math.max(1, totalViews)) * 100)}%` }} />
                      <span className="text-xs text-gray-400 truncate max-w-full">{l.title.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  {[["Total views", totalViews], ["Listings", listings.length], ["Avg. rating", listings.length ? `${avgRating} ★` : "—"]].map(([k,v]) => (
                    <div key={k} className="text-center">
                      <div className="text-lg font-bold text-gray-900">{v}</div>
                      <div className="text-xs text-gray-400">{k}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showNewListing && (
        <NewListingModal
          token={token}
          onClose={() => setShowNewListing(false)}
          onCreated={(listing) => {
            setListings(ls => [...ls, listing]);
            setShowNewListing(false);
          }}
        />
      )}
    </div>
  );
}
