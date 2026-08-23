import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ThumbsUp, ThumbsDown, ChevronRight, Star } from "lucide-react";
import { useState } from "react";

export default function AISuggestionPanel({ suggestions, query }) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white border border-primary-200 rounded-2xl p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 bg-primary-400 rounded-lg flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm text-gray-900">AI suggestions</span>
      </div>
      <p className="text-xs text-gray-500 mb-4 ml-9">Based on your search</p>

      {/* Suggestion cards */}
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-white border border-primary-100 hover:border-primary-400 rounded-xl overflow-hidden transition-all group">
            <button onClick={() => navigate(s.listing ? `/listing/${s.listing.id}` : `/search?category=${s.categorySlug}`)} className="w-full text-left p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition">{s.category}</div>
                    <div className="text-xs text-gray-400">{s.reason}</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-400 transition flex-shrink-0" />
              </div>
            </button>

            {/* A real listing behind the suggestion, not just a category label */}
            {s.listing && (
              <Link to={`/listing/${s.listing.id}`}
                className="flex items-center gap-2.5 px-3 pb-3 pt-2 border-t border-gray-50 hover:bg-gray-50 transition">
                <img src={s.listing.image} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-800 truncate">{s.listing.title}</div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                    <Star size={9} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    {s.listing.rating > 0 ? s.listing.rating : "New"}
                    <span className="mx-0.5">·</span>
                    Rs. {s.listing.price?.toLocaleString()}
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="mt-4 pt-4 border-t border-primary-100">
        <p className="text-xs text-gray-500 mb-2">Were these suggestions useful?</p>
        <div className="flex gap-2">
          <button onClick={() => setFeedback("yes")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition border ${feedback === "yes" ? "bg-primary-400 text-white border-primary-400" : "border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-600"}`}>
            <ThumbsUp size={11} /> Yes
          </button>
          <button onClick={() => setFeedback("no")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition border ${feedback === "no" ? "bg-red-100 text-red-600 border-red-300" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"}`}>
            <ThumbsDown size={11} /> No
          </button>
        </div>
        {feedback && <p className="text-xs text-primary-600 mt-2 font-medium">Thanks for your feedback!</p>}
      </div>
    </div>
  );
}
