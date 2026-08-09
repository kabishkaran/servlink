import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Users, LayoutList, Star, Activity, Shield, Ban, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getPendingProviders, verifyProvider, getAdminAnalytics, SERVER_URL,
  getAllUsers, setUserActive, getAllListingsAdmin, moderateListing,
} from "../lib/api";

export default function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("verification");
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [forbidden, setForbidden] = useState(false);

  const refreshAll = () => {
    getPendingProviders(token).then(data => { setQueue(data); setSelected(prev => prev ?? data[0] ?? null); }).catch(() => {});
    getAdminAnalytics(token).then(setAnalytics).catch(() => {});
    getAllUsers(token).then(setUsers).catch(() => {});
    getAllListingsAdmin(token).then(setAdminListings).catch(() => {});
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { setForbidden(true); return; }
    refreshAll();
  }, [user, token, loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return null;
  if (forbidden) return <div className="min-h-screen flex items-center justify-center text-gray-400">Admin access only.</div>;

  const decide = async (id, approve) => {
    try {
      await verifyProvider(id, approve, token);
      setQueue(q => {
        const next = q.filter(p => p.id !== id);
        setSelected(next[0] || null);
        return next;
      });
      getAdminAnalytics(token).then(setAnalytics).catch(() => {});
    } catch {
      // leave the queue as-is; the entry stays available to retry
    }
  };

  const toggleUserActive = async (u) => {
    try {
      const updated = await setUserActive(u.id, !u.is_active, token);
      setUsers(us => us.map(x => x.id === updated.id ? updated : x));
    } catch (err) {
      alert(err.message || "Could not update user.");
    }
  };

  const toggleListingAvailable = async (l) => {
    try {
      const updated = await moderateListing(l.id, !l.available, token);
      setAdminListings(ls => ls.map(x => x.id === updated.id ? updated : x));
    } catch {
      // leave listing as-is
    }
  };

  const totalListings = analytics?.listings_by_category.reduce((sum, c) => sum + c.count, 0) ?? 0;
  const bookingsToday = analytics ? Object.values(analytics.bookings_by_status).reduce((sum, n) => sum + n, 0) : 0;

  const stats = [
    { label:"Total users",     value: analytics?.total_users ?? "—",   icon:<Users size={18} className="text-blue-500" /> },
    { label:"Active listings", value: totalListings,                    icon:<LayoutList size={18} className="text-primary-400" /> },
    { label:"Providers",       value: analytics?.total_providers ?? "—", icon:<Star size={18} className="text-amber-400" /> },
    { label:"Total bookings",  value: bookingsToday,                    icon:<Activity size={18} className="text-green-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary-400" />
            <span className="font-semibold">ServLink Admin</span>
          </div>
          <span className="text-xs text-gray-400">Admin Console</span>
        </div>
        <div className="px-6 flex gap-1">
          {["verification", "users", "listings"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 ${activeTab === tab ? "text-white border-primary-400" : "text-gray-400 border-transparent hover:text-gray-200"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">{s.icon}<span className="text-xs text-gray-500">{s.label}</span></div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Verification queue */}
        {activeTab === "verification" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 text-sm">Verification queue</h2>
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{queue.length} pending</span>
                </div>
                {queue.length === 0 ? (
                  <div className="px-5 py-10 text-center text-gray-400">
                    <CheckCircle size={24} className="mx-auto mb-2 text-green-400" />
                    <p className="text-sm">All verified!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {queue.map(p => (
                      <button key={p.id} onClick={() => setSelected(p)}
                        className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition ${selected?.id === p.id ? "bg-primary-50 border-l-2 border-primary-400" : ""}`}>
                        <div className="font-medium text-sm text-gray-900">{p.business_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.category.name} · {new Date(p.submitted_at).toLocaleDateString()}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-3">
              {selected ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Document review</h3>
                  {selected.nic_document_path ? (
                    <a href={`${SERVER_URL}${selected.nic_document_path}`} target="_blank" rel="noreferrer"
                      className="h-44 bg-gray-100 rounded-xl flex items-center justify-center mb-5 hover:bg-gray-200 transition">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm underline">View NIC document</p>
                      </div>
                    </a>
                  ) : (
                    <div className="h-44 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm">No NIC document uploaded</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 mb-5">
                    {[
                      ["Business", selected.business_name],
                      ["Category", selected.category.name],
                      ["Applicant", selected.user_name],
                      ["Email", selected.user_email],
                      ["Submitted", new Date(selected.submitted_at).toLocaleDateString()],
                      ["Certification", selected.cert_document_path ? "Uploaded" : "Not provided"],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => decide(selected.id, true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl text-sm font-semibold transition">
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button onClick={() => decide(selected.id, false)}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm font-semibold transition">
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
                  Select an application to review
                </div>
              )}
            </div>
          </div>
        )}

        {/* User management */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">All users</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {users.map(u => (
                <div key={u.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">{u.role}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${u.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {u.is_active ? "Active" : "Suspended"}
                  </span>
                  {u.id === user.id ? (
                    <span className="text-xs text-gray-400">(you)</span>
                  ) : (
                    <button onClick={() => toggleUserActive(u)}
                      className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition ${u.is_active ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-primary-400 hover:bg-primary-600 text-white"}`}>
                      {u.is_active ? <><Ban size={12} /> Suspend</> : <><RotateCcw size={12} /> Reactivate</>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listing moderation */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">All listings</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {adminListings.map(l => (
                <div key={l.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <img src={l.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{l.title}</div>
                    <div className="text-xs text-gray-500">{l.provider.business_name} · {l.category.name}</div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${l.available ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {l.available ? "Active" : "Paused"}
                  </span>
                  <button onClick={() => toggleListingAvailable(l)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition">
                    {l.available ? "Pause" : "Reactivate"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
