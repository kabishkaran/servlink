import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Shield, Sparkles, ArrowRight } from "lucide-react";
import { getCategories, getListings, mapListing } from "../lib/api";
import ListingCard from "../components/ListingCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getListings().then(data => setListings(data.map(mapListing))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const featured = listings.filter(l => l.topRated).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark via-dark-800 to-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-400/20 text-primary-200 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-primary-400/30">
            <Sparkles size={12} /> AI-powered service recommendations
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Find any local service,<br />
            <span className="text-primary-400">instantly</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Rent a home, hire a plumber, book a mover — all in one place, with AI that suggests exactly what else you need.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-5">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for a house, electrician, plumber…"
                className="flex-1 py-4 text-gray-800 placeholder-gray-400 outline-none text-sm bg-transparent"
              />
            </div>
            <button type="submit"
              className="bg-primary-400 hover:bg-primary-600 text-white px-6 py-4 font-medium text-sm transition flex-shrink-0">
              Search
            </button>
          </form>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.slice(0, 6).map(c => (
              <button key={c.id}
                onClick={() => navigate(`/search?category=${c.slug}`)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition">
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-6 text-center">
          {[["500+","Verified Providers"],["1,200+","Happy Customers"],["4.8★","Average Rating"]].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-gray-900">{num}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by category</h2>
        <p className="text-gray-500 text-sm mb-8">Find exactly the service you need</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map(c => (
            <button key={c.id}
              onClick={() => navigate(`/search?category=${c.slug}`)}
              className="group bg-white border border-gray-100 hover:border-primary-400 rounded-2xl p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="font-medium text-gray-900 text-sm group-hover:text-primary-600 transition">{c.name}</div>
              <div className="text-xs text-gray-400 mt-1">{listings.filter(l=>l.categoryId===c.id).length} providers →</div>
            </button>
          ))}
        </div>
      </section>

      {/* Top rated */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Top rated listings</h2>
              <p className="text-gray-500 text-sm mt-1">Highly rated by real customers</p>
            </div>
            <button onClick={() => navigate("/search")}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-400 font-medium transition">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How ServLink works</h2>
        <p className="text-gray-500 text-sm mb-12">Three simple steps to find your service</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step:"01", icon:<Search size={22} className="text-primary-400"/>, title:"Search", body:"Type what you need in plain language. Our AI understands your query." },
            { step:"02", icon:<Sparkles size={22} className="text-primary-400"/>, title:"Get suggestions", body:"AI recommends related services you'll likely need — all in one go." },
            { step:"03", icon:<Star size={22} className="text-primary-400"/>, title:"Book & review", body:"Choose a verified provider, book directly, and leave a review after." },
          ].map(s => (
            <div key={s.step} className="relative">
              <div className="text-5xl font-bold text-gray-100 mb-4">{s.step}</div>
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 -mt-8">
                {s.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark text-white py-14 mx-4 mb-8 rounded-3xl max-w-6xl lg:mx-auto">
        <div className="text-center px-4">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-gray-400 mb-8 text-sm">Join hundreds of customers who found their perfect service provider on ServLink.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/search")}
              className="bg-primary-400 hover:bg-primary-600 text-white px-8 py-3 rounded-full font-medium transition">
              Find a service
            </button>
            <button onClick={() => navigate("/provider/register")}
              className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition">
              List your service
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
