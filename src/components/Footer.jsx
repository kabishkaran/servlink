import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-white font-semibold">ServLink</span>
            </div>
            <p className="text-xs leading-relaxed">Connecting customers with verified local service providers using AI-powered recommendations.</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search" className="hover:text-white transition">Browse services</Link></li>
              <li><Link to="/search?category=house-rental" className="hover:text-white transition">House rentals</Link></li>
              <li><Link to="/search?category=electrician" className="hover:text-white transition">Electricians</Link></li>
              <li><Link to="/search?category=plumber" className="hover:text-white transition">Plumbers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-3">Providers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/provider/register" className="hover:text-white transition">Become a provider</Link></li>
              <li><Link to="/provider/dashboard" className="hover:text-white transition">Provider dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-800 pt-6 text-xs text-center">
          © 2026 ServLink. All rights reserved. Built as an individual final year project.
        </div>
      </div>
    </footer>
  );
}
