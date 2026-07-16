import { useState } from "react";
import { CheckCircle, XCircle, Users, LayoutList, Star, Activity, Shield } from "lucide-react";

const pending = [
  { id:1, name:"W. Ranasinghe",      category:"Plumber",     submitted:"Jun 18", doc:"NIC.pdf" },
  { id:2, name:"QuickMove Transport", category:"Movers",      submitted:"Jun 19", doc:"NIC.pdf" },
  { id:3, name:"S. Bandara",          category:"Electrician", submitted:"Jun 20", doc:"NIC.pdf" },
];

export default function AdminDashboard() {
  const [queue, setQueue] = useState(pending);
  const [selected, setSelected] = useState(queue[0]);

  const approve = (id) => { setQueue(q => q.filter(p => p.id !== id)); setSelected(queue[0] || null); };
  const reject  = (id) => { setQueue(q => q.filter(p => p.id !== id)); setSelected(queue[0] || null); };

  const stats = [
    { label:"Total users",   value:"1,284", icon:<Users size={18} className="text-blue-500" /> },
    { label:"Active listings",value:"342",  icon:<LayoutList size={18} className="text-primary-400" /> },
    { label:"Avg rating",    value:"4.7 ★", icon:<Star size={18} className="text-amber-400" /> },
    { label:"Bookings today",value:"28",    icon:<Activity size={18} className="text-green-500" /> },
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
                      <div className="font-medium text-sm text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.category} · {p.submitted}</div>
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
                {/* Doc preview placeholder */}
                <div className="h-44 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm">{selected.doc}</p>
                    <p className="text-xs mt-1">NIC document preview</p>
                  </div>
                </div>
                {/* Details */}
                <div className="space-y-2 mb-5">
                  {[["Name", selected.name], ["Category", selected.category], ["Submitted", selected.submitted], ["Document", selected.doc]].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => approve(selected.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl text-sm font-semibold transition">
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => reject(selected.id)}
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
