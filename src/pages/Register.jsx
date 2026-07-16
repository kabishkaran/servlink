import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"customer" });
  const [showPw, setShowPw] = useState(false);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form.email, form.role);
    navigate(form.role === "provider" ? "/provider/register" : "/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ServLink</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Create an account</h1>
          <p className="text-gray-500 text-sm">Join ServLink today — it's free</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {["customer","provider"].map(r => (
              <button key={r} onClick={() => setForm(f=>({...f, role:r}))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${form.role === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                {r === "customer" ? "I'm a Customer" : "I'm a Provider"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Full name</label>
              <input value={form.name} onChange={set("name")} placeholder="Your full name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit"
              className="w-full bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm transition mt-2">
              Create account
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">By signing up you agree to our <a href="#" className="text-primary-600">Terms</a> and <a href="#" className="text-primary-600">Privacy Policy</a></p>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
