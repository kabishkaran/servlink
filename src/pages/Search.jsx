import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Sparkles, BrainCircuit } from "lucide-react";
import { listings, categories, aiSuggestions } from "../data/mockData";
import ListingCard from "../components/ListingCard";
import AISuggestionPanel from "../components/AISuggestionPanel";
import AIModelPanel from "../components/AIModelPanel";
import { classifyQuery } from "../lib/api";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [priceMax, setPriceMax] = useState(200000);
  const [ratingMin, setRatingMin] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [prediction, setPrediction] = useState(null); // { category, confidence } from the live classifier

  // Live-classify free text into a category via the trained model (debounced).
  // Picking a category pill instead of typing skips the model entirely.
  useEffect(() => {
    if (activeCategory || !query.trim()) { setPrediction(null); return; }
    const handle = setTimeout(() => {
      classifyQuery(query).then(setPrediction).catch(() => setPrediction(null));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, activeCategory]);

  // AI suggestions still come from the curated category->related-category table;
  // only *which* category applies now comes from the model instead of keyword rules.
  const suggestions = useMemo(() => {
    if (activeCategory) return aiSuggestions[activeCategory] || [];
    if (prediction) return aiSuggestions[prediction.category] || [];
    return [];
  }, [activeCategory, prediction]);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      const matchQ = !query || l.title.toLowerCase().includes(query.toLowerCase()) || l.category.toLowerCase().includes(query.toLowerCase()) || l.location.toLowerCase().includes(query.toLowerCase());
      const matchCat = !activeCategory || l.category.toLowerCase().replace(/ /g,"-") === activeCategory;
      const matchPrice = l.price <= priceMax;
      const matchRating = l.rating >= ratingMin;
      const matchVerified = !verifiedOnly || l.verified;
      return matchQ && matchCat && matchPrice && matchRating && matchVerified;
    });
  }, [query, activeCategory, priceMax, ratingMin, verifiedOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    setActiveCategory("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search services, locations…"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent" />
              {query && <button type="button" onClick={() => { setQuery(""); setSearchParams({}); }}><X size={14} className="text-gray-400" /></button>}
            </div>
            <button type="submit" className="bg-primary-400 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">Search</button>
            <button type="button" onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-medium transition ${showFilters ? "bg-primary-50 border-primary-400 text-primary-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            <button type="button" onClick={() => setShowModelInfo(!showModelInfo)}
              className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-medium transition ${showModelInfo ? "bg-primary-50 border-primary-400 text-primary-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <BrainCircuit size={15} /> Model info
            </button>
          </form>

          {showModelInfo && (
            <div className="mt-3">
              <AIModelPanel />
            </div>
          )}

          {/* Category pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => setActiveCategory("")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${!activeCategory ? "bg-dark text-white border-dark" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
              All
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.slug)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition border ${activeCategory === c.slug ? "bg-primary-400 text-white border-primary-400" : "border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Max price (Rs.)</label>
                <input type="range" min={1000} max={200000} step={1000} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-primary-400" />
                <span className="text-xs text-gray-500">Up to Rs. {priceMax.toLocaleString()}</span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Minimum rating</label>
                <div className="flex gap-2">
                  {[0,3,4,4.5].map(r => (
                    <button key={r} onClick={() => setRatingMin(r)}
                      className={`text-xs px-2 py-1 rounded-lg border transition ${ratingMin === r ? "bg-primary-400 text-white border-primary-400" : "border-gray-200 text-gray-600"}`}>
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="verified" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}
                  className="accent-primary-400" />
                <label htmlFor="verified" className="text-xs font-medium text-gray-600">Verified providers only</label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Listings grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filtered.length}</span> results
                {activeCategory && <span> in <span className="text-primary-600">{categories.find(c=>c.slug===activeCategory)?.name}</span></span>}
                {query && <span> for "<span className="text-primary-600">{query}</span>"</span>}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-medium text-gray-600">No results found</p>
                <p className="text-sm mt-1">Try a different search term or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>

          {/* AI Panel */}
          {suggestions.length > 0 && (
            <div className="hidden lg:block w-72 flex-shrink-0 space-y-3">
              {prediction && !activeCategory && (
                <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-3 py-2 text-xs text-primary-700">
                  <Sparkles size={13} className="flex-shrink-0" />
                  <span>Model read this as <strong className="capitalize">{prediction.category.replace(/-/g, " ")}</strong> ({Math.round(prediction.confidence * 100)}% confidence)</span>
                </div>
              )}
              <AISuggestionPanel suggestions={suggestions} query={query} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
