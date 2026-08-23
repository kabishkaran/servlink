import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Search from "./pages/Search";
import ListingDetail from "./pages/ListingDetail";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Messages from "./pages/Messages";
import CustomerProfile from "./pages/CustomerProfile";
import ProviderRegister from "./pages/ProviderRegister";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<WithNav><Home /></WithNav>} />
          <Route path="/search" element={<WithNav><Search /></WithNav>} />
          <Route path="/listing/:id" element={<WithNav><ListingDetail /></WithNav>} />
          <Route path="/booking/:id" element={<WithNav><Booking /></WithNav>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<WithNav><CustomerProfile /></WithNav>} />
          <Route path="/messages" element={<WithNav><Messages /></WithNav>} />
          <Route path="/provider/register" element={<WithNav><ProviderRegister /></WithNav>} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function WithNav({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
