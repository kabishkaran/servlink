import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Users, LayoutList, Star, Activity, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getPendingProviders, verifyProvider, getAdminAnalytics, SERVER_URL } from "../lib/api";

export default function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { setForbidden(true); return; }

    getPendingProviders(token).then(data => { setQueue(data); setSelected(data[0] || null); }).catch(() => {});
    getAdminAnalytics(token).then(setAnalytics).catch(() => {});
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
    } catch {
      // leave the queue as-is; the entry stays available to retry
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
      <div className="bg-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-primary-400" />
          <span className="font-semibold">ServLink Admin</span>
        </div>
        <span className="text-xs text-gray-400">Admin Console</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Queue list */}
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

          {/* Detail panel */}
          <div className="md:col-span-3">
            {selected ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Document review</h3>
                {/* Doc preview */}
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
                {/* Details */}
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
      </div>
    </div>
  );
}
