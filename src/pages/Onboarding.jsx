import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { getCategories, submitOnboardingQuiz } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    getCategories().then(setCategories).catch(() => {});
  }, [user, loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return null;

  const toggle = (slug) => setSelected(s => s.includes(slug) ? s.filter(x => x !== slug) : [...s, slug]);

  const finish = async () => {
    setSubmitting(true);
    try {
      if (selected.length > 0) await submitOnboardingQuiz(selected, token);
    } catch {
      // non-critical — the app still works fine without quiz picks
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">What are you interested in?</h1>
          <p className="text-gray-500 text-sm">Pick a few categories so our AI can tailor suggestions to you from the start.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map(c => (
              <button key={c.id} onClick={() => toggle(c.slug)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border text-sm font-medium transition ${selected.includes(c.slug) ? "bg-primary-50 border-primary-400 text-primary-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <span className="text-xl">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={finish} disabled={submitting}
          className="w-full bg-primary-400 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm transition disabled:opacity-60">
          {submitting ? "Saving…" : selected.length > 0 ? `Continue with ${selected.length} selected` : "Skip for now"}
        </button>
      </div>
    </div>
  );
}
