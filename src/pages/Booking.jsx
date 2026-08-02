import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Calendar, Clock, FileText } from "lucide-react";
import { getListing, createBooking, mapListing } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Details", "Schedule", "Confirm"];
const SLOTS = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Maps the day-of-week picker (Mon..Sun) to the next real calendar date for
// that weekday, since the backend needs an actual date, not just a label.
function nextDateForWeekday(dayIndex) {
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // convert Sun=0..Sat=6 to Mon=0..Sun=6
  let delta = dayIndex - todayIndex;
  if (delta < 0) delta += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + delta);
  return result.toISOString().slice(0, 10);
}

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();
  const [listing, setListing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    getListing(id).then(l => setListing(mapListing(l))).catch(() => setNotFound(true));
  }, [id, user, loading]);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading…</div>;
  if (notFound) return <div className="p-10 text-center text-gray-400">Listing not found.</div>;
  if (!user || !listing) return <div className="p-10 text-center text-gray-400">Loading…</div>;

  const canNext = step === 0 ? true : step === 1 ? (selectedDay !== null && selectedSlot !== null) : true;

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await createBooking({
        listing_id: listing.id,
        booking_date: nextDateForWeekday(selectedDay),
        time_slot: selectedSlot,
        notes,
      }, token);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking sent!</h2>
          <p className="text-gray-500 text-sm mb-2">Your request has been sent to <strong>{listing.provider}</strong>.</p>
          <p className="text-gray-400 text-xs mb-8">They typically respond within 2 hours. You'll be notified by email.</p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="font-medium text-gray-900">{listing.title}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{DAYS[selectedDay]}, this week</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-medium text-gray-900">{selectedSlot}</span></div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2"><span className="text-gray-500">Estimated</span><span className="font-bold text-gray-900">Rs. {listing.price.toLocaleString()}</span></div>
          </div>
          <button onClick={() => navigate("/profile")}
            className="w-full bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl font-medium text-sm transition mb-3">
            View my bookings
          </button>
          <button onClick={() => navigate("/")} className="w-full text-gray-500 hover:text-gray-700 text-sm transition">Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={15} /> {step === 0 ? "Back to listing" : "Previous step"}
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Request booking</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${i < step ? "bg-primary-400 text-white" : i === step ? "bg-dark text-white" : "bg-gray-200 text-gray-400"}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? "text-gray-900" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-10 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
          {/* Step 0: Details */}
          {step === 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText size={16} className="text-primary-400" /> Service details</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex gap-4">
                  <img src={listing.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{listing.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{listing.provider} · {listing.location}</div>
                    <div className="text-sm font-bold text-primary-600 mt-2">Rs. {listing.price.toLocaleString()} / {listing.unit}</div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Notes for provider (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                  placeholder="Describe what you need in detail — e.g. 3-bedroom house, full rewire needed, asap..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 resize-none transition" />
              </div>
            </div>
          )}

          {/* Step 1: Schedule */}
          {step === 1 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={16} className="text-primary-400" /> Select date & time</h2>
              <p className="text-xs text-gray-500 mb-4">Choose a preferred day this week</p>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => setSelectedDay(i)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium transition border ${selectedDay === i ? "bg-primary-400 text-white border-primary-400" : "border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                    <span className="text-xs opacity-70">{d}</span>
                    <span className="font-bold">{14 + i}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><Clock size={12} /> Available time slots</p>
              <div className="grid grid-cols-2 gap-3">
                {SLOTS.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`py-3 rounded-xl text-sm font-medium transition border ${selectedSlot === slot ? "bg-dark text-white border-dark" : "border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle size={16} className="text-primary-400" /> Confirm your booking</h2>
              <div className="space-y-3">
                {[
                  ["Service", listing.title],
                  ["Provider", listing.provider],
                  ["Location", listing.location],
                  ["Day", selectedDay !== null ? `${DAYS[selectedDay]}, this week` : "-"],
                  ["Time", selectedSlot || "-"],
                  ["Notes", notes || "None"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{k}</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-xs truncate">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-gray-900">Estimated cost</span>
                  <span className="font-bold text-primary-600 text-lg">Rs. {listing.price.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700">💡 Final price will be confirmed by the provider. No payment collected now.</p>
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100 mb-3">{error}</div>}

        {/* Next / Submit */}
        <button
          disabled={!canNext || submitting}
          onClick={() => step < 2 ? setStep(s => s+1) : handleSubmit()}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition ${canNext && !submitting ? "bg-primary-400 hover:bg-primary-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          {step < 2 ? "Continue →" : submitting ? "Sending…" : "Send booking request"}
        </button>
      </div>
    </div>
  );
}
