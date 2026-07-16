import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Star, Eye, Calendar, Plus, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { listings } from "../data/mockData";

const mockBookings = [
  { id:1, customer:"Nimal Silva", service:"Wiring repair", date:"Jun 24", time:"11:00 AM", status:"pending" },
  { id:2, customer:"Priya Kumar", service:"Socket installation", date:"Jun 26", time:"2:00 PM", status:"confirmed" },
  { id:3, customer:"Harsha W.", service:"Safety inspection", date:"Jun 20", time:"9:00 AM", status:"completed" },
];

const statusConfig = {
  pending:   { icon:<Clock size={12}/>,       label:"Pending",   cls:"bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { icon:<CheckCircle size={12}/>,  label:"Confirmed", cls:"bg-green-50 text-green-700 border-green-200" },
  completed: { icon:<Star size={12}/>,         label:"Completed", cls:"bg-blue-50 text-blue-700 border-blue-200" },
};

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState(mockBookings);

  if (!user) { navigate("/login"); return null; }

  const myListings = listings.slice(0, 2);

  const handleAccept = (id) => setBookings(bs => bs.map(b => b.id === id ? {...b, status:"confirmed"} : b));
  const handleDecline = (id) => setBookings(bs => bs.filter(b => b.id !== id));

  const stats = [
    { label:"Listing views",  value:"1,284", icon:<Eye size={18} className="text-primary-400" />,      delta:"+12%" },
    { label:"Enquiries",      value:"42",    icon:<Calendar size={18} className="text-blue-500" />,    delta:"+8%" },
    { label:"Bookings",       value:"18",    icon:<CheckCircle size={18} className="text-green-500" />, delta:"+23%" },
    { label:"Rating",         value:"4.8 ★", icon:<Star size={18} className="text-amber-400" />,       delta:"" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-dark text-white border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Provider Dashboard</h1>
            <p className="text-gray-400 text-xs mt-0.5">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/provider/listing/new")}
              className="flex items-center gap-1.5 bg-primary-400 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Plus size={14} /> New listing
            </button>
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
              {s.delta && <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1"><TrendingUp size={10} />{s.delta} this month</div>}
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
            <div className="divide-y divide-gray-100">
              {bookings.map(b => (
                <div key={b.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                    {b.customer[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{b.customer}</div>
                    <div className="text-xs text-gray-500">{b.service} · {b.date} at {b.time}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig[b.status].cls}`}>
                      {statusConfig[b.status].icon} {statusConfig[b.status].label}
                    </span>
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(b.id)}
                          className="bg-primary-400 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">Accept</button>
                        <button onClick={() => handleDecline(b.id)}
                          className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition">Decline</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "overview" || activeTab === "listings") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My listings</h2>
              <button onClick={() => navigate("/provider/listing/new")}
                className="text-sm text-primary-600 hover:text-primary-400 font-medium flex items-center gap-1">
                <Plus size={14} /> Add listing
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                  <img src={l.image} alt="" className="w-20 h-20 object-cover flex-shrink-0" />
                  <div className="p-4 flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{l.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={10} /> 312 views</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Star size={10} className="text-amber-400" /> {l.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-primary-600">Rs. {l.price.toLocaleString()}/{l.unit}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${l.available ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {l.available ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-shrink-0 flex flex-col gap-2 justify-center">
                    <button className="text-xs text-primary-600 hover:text-primary-400 font-medium">Edit</button>
                    <button className="text-xs text-gray-400 hover:text-gray-600">Pause</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><BarChart3 size={16} className="text-primary-400" /> Performance analytics</h2>
            {/* Simple bar chart */}
            <p className="text-xs text-gray-500 mb-4">Views over the last 7 days</p>
            <div className="flex items-end gap-3 h-32 mb-4">
              {[45, 62, 58, 78, 92, 85, 104].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary-400 rounded-t-md transition-all" style={{ height: `${(v/104)*100}%` }} />
                  <span className="text-xs text-gray-400">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              {[["Total views","1,284"],["Click-through","8.4%"],["Avg. response","1.8 hrs"]].map(([k,v]) => (
                <div key={k} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{v}</div>
                  <div className="text-xs text-gray-400">{k}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
