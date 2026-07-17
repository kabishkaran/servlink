import { useState, useEffect } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { classifyQuery, getModelMetrics } from "../lib/api";

// Manually measured on 26 hand-written queries never seen in training
// (backend/ml/smoke_test.py) - not part of the model's own metrics.json,
// since that only covers the held-out split from the same templates.
const NOVEL_QUERY_ACCURACY = 0.731;

export default function AIModelPanel() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(false);
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getModelMetrics().then(setMetrics).catch(() => setError(true));
  }, []);

  const runTest = async (e) => {
    e.preventDefault();
    if (!testText.trim()) return;
    setTesting(true);
    try {
      const result = await classifyQuery(testText);
      setTestResult(result);
    } catch {
      setTestResult(null);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center flex-shrink-0">
          <BrainCircuit size={16} className="text-primary-400" />
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-900">Search classifier model</div>
          <div className="text-xs text-gray-400">TF-IDF + Logistic Regression, trained on 1,012 labeled queries</div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">Could not reach the model API — is the backend running on :8000?</p>}

      {metrics && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-0.5">Held-out test accuracy</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{(NOVEL_QUERY_ACCURACY * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-0.5">Novel-phrasing accuracy</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{metrics.n_train + metrics.n_test}</div>
            <div className="text-xs text-gray-400 mt-0.5">Training examples</div>
          </div>
        </div>
      )}

      <form onSubmit={runTest} className="flex gap-2">
        <input
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Try your own query, e.g. 'my toilet keeps overflowing'"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400 transition"
        />
        <button type="submit" disabled={testing}
          className="bg-primary-400 hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5">
          {testing ? <Loader2 size={14} className="animate-spin" /> : "Classify"}
        </button>
      </form>

      {testResult && (
        <div className="mt-3 flex flex-wrap gap-2">
          {testResult.scores.slice(0, 4).map((s) => (
            <span key={s.category}
              className={`text-xs px-2.5 py-1 rounded-full border ${s.category === testResult.category
                ? "bg-primary-400 text-white border-primary-400 font-semibold"
                : "border-gray-200 text-gray-500"}`}>
              {s.category.replace(/-/g, " ")} {Math.round(s.score * 100)}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
