import { Link } from "react-router-dom";
import { Star, MapPin, BadgeCheck } from "lucide-react";

export default function ListingCard({ listing }) {
  const { id, title, provider, rating, reviews, price, unit, location, verified, topRated, image, category } = listing;

  return (
    <Link to={`/listing/${id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/90 backdrop-blur text-xs font-medium px-2 py-1 rounded-full text-gray-700">{category}</span>
          {topRated && <span className="bg-primary-400 text-white text-xs font-medium px-2 py-1 rounded-full">Top Rated</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{title}</h3>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-gray-500">{provider}</span>
          {verified && <BadgeCheck size={13} className="text-primary-400 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-gray-800">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
          <span className="mx-1 text-gray-300">·</span>
          <MapPin size={12} className="text-gray-400" />
          <span className="text-xs text-gray-500">{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">Rs. {price.toLocaleString()}</span>
            <span className="text-xs text-gray-400"> / {unit}</span>
          </div>
          <span className="text-xs font-medium text-primary-600 group-hover:text-primary-400 transition">View →</span>
        </div>
      </div>
    </Link>
  );
}
