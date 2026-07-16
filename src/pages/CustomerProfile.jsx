import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bookmark, Star, Settings, Calendar, BadgeCheck } from "lucide-react";
import { listings } from "../data/mockData";

const mockBookings = [
  { id: 1, listingId: 3, date: "Jun 24, 2026", time: "11:00 AM", status: "confirmed" },
  { id: 2, listingId: 1, date: "May 12, 2026", time: "9:00 AM",  status: "completed" },
  { id: 3, listingId: 4, date: "Apr 30, 2026", time: "2:00 PM",  status: "cancelled" },
];
const statusStyle = { confirmed:"bg-green-50 text-green-700 border-green-200", completed:"bg-blue-50 text-blue-700 border-blue-200", cancelled:"bg-red-50 text-red-600 border-red-200" };

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) { navigate("/login"); return null; }

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
            <span className="inline-block mt-1 bg-primary-50 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">Customer</span>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition">Sign out</button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bookings */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Calendar size={16} className="text-primary-400" /> My bookings</h2>
            {mockBookings.map(b => {
              const listing = listings.find(l => l.id === b.listingId);
              if (!listing) return null;
              return (
                <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
                  <img src={listing.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{listing.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{listing.provider}</div>
                    <div className="text-xs text-gray-400 mt-1">{b.date} · {b.time}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                    {b.status === "completed" && (
                      <button className="text-xs text-primary-600 hover:text-primary-400 font-medium">Leave review</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2"><Settings size={14} /> Account</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Display name</label>
                  <input defaultValue={user.name} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email</label>
                  <input defaultValue={user.email} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                </div>
                <button className="w-full bg-primary-400 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-medium transition">
                  Save changes
                </button>
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
