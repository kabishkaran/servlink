import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, BadgeCheck, MessageSquare, Calendar, ArrowLeft, Share2 } from "lucide-react";
import { getListing, getListingReviews, getCategories, getRecommendations, mapListing, attachTopListings } from "../lib/api";
import AISuggestionPanel from "../components/AISuggestionPanel";
import { useAuth } from "../context/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [listingReviews, setListingReviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getListing(id).then(l => setListing(mapListing(l))).catch(() => setNotFound(true));
    getListingReviews(id).then(setListingReviews).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!listing) return;
    getCategories().then(categories => {
      const bySlug = Object.fromEntries(categories.map(c => [c.slug, c]));
      getRecommendations(listing.categorySlug)
        .then(data => {
          const withLabels = data.suggestions.map(s => ({
            categorySlug: s.category,
            category: s.label,
            icon: bySlug[s.category]?.icon || "✨",
            reason: s.reason,
          }));
          attachTopListings(withLabels).then(setSuggestions);
        })
        .catch(() => setSuggestions([]));
    }).catch(() => {});
  }, [listing]);

  if (notFound) return <div className="p-10 text-center text-gray-400">Listing not found.</div>;
  if (!listing) return <div className="p-10 text-center text-gray-400">Loading…</div>;

  const handleBook = () => {
    if (!user) { navigate("/login"); return; }
    navigate(`/booking/${listing.id}`);
  };

  const handleMessage = () => {
    if (!user) { navigate("/login"); return; }
    navigate("/messages", {
      state: {
        recipientId: listing.providerUserId,
        recipientName: listing.provider,
        listingId: listing.id,
        listingTitle: listing.title,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-4">
          <ArrowLeft size={15} /> Back to results
        </button>
      </div>

      {/* Hero image */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-200">
          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
            <button className="bg-white/90 backdrop-blur p-2 rounded-full shadow">
              <Share2 size={16} className="text-gray-600" />
            </button>
          </div>
          {listing.topRated && (
            <div className="absolute bottom-4 left-4 bg-primary-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full">⭐ Top Rated</div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <span className="bg-primary-50 text-primary-600 text-xs font-medium px-2.5 py-1 rounded-full">{listing.category}</span>
                {listing.verified && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    <BadgeCheck size={12} /> Verified provider
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-gray-800">{listing.rating}</span>
                  <span>({listing.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} /> {listing.location}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 mb-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">About this service</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-medium text-gray-600">Service area: </span>
                <span className="text-xs text-gray-500">{listing.serviceArea}</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-1">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-gray-900">{listing.rating}</span>
                  <span className="text-gray-400 text-sm">· {listing.reviews} reviews</span>
                </div>
              </div>
              {listingReviews.length > 0 ? (
                <div className="space-y-4">
                  {listingReviews.map(r => (
                    <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-800">{r.author_name}</span>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({length:5}).map((_,i) => (
                          <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No reviews yet. Be the first to book and review!</p>
              )}
            </div>
          </div>

          {/* Right column: booking card + AI panel */}
          <div className="lg:w-80 flex-shrink-0 space-y-5">
            {/* Booking card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">Rs. {listing.price.toLocaleString()}</span>
                <span className="text-gray-400 text-sm"> / {listing.unit}</span>
              </div>

              {/* Provider */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                <div className="w-10 h-10 bg-primary-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {listing.provider[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{listing.provider}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    {listing.verified && <BadgeCheck size={11} className="text-primary-400" />} Verified provider
                  </div>
                </div>
              </div>

              <button onClick={handleBook}
                className="w-full bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm transition mb-3 flex items-center justify-center gap-2">
                <Calendar size={15} /> Request booking
              </button>
              {user?.id !== listing.providerUserId && (
                <button onClick={handleMessage}
                  className="w-full border border-gray-200 hover:border-primary-400 text-gray-700 hover:text-primary-600 py-3 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2">
                  <MessageSquare size={15} /> Message provider
                </button>
              )}

              <p className="text-xs text-gray-400 text-center mt-3">No charge until you confirm</p>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && <AISuggestionPanel suggestions={suggestions} />}
          </div>
        </div>
      </div>
    </div>
  );
}
