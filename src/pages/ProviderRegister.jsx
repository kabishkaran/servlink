import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Upload, MapPin } from "lucide-react";
import { categories } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

export default function ProviderRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name:"", category:"", description:"", pricing:"hourly", price:"", area:"", nic:null, cert:null });
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const STEPS = ["Profile", "Listing", "Documents"];

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application submitted!</h2>
        <p className="text-gray-500 text-sm mb-8">Your provider application is under review. We'll notify you within 24 hours once your NIC is verified.</p>
        <button onClick={() => navigate("/provider/dashboard")}
          className="w-full bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl font-medium text-sm transition">
          Go to dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Become a provider</h1>
        <p className="text-gray-500 text-sm mb-8">List your service and reach thousands of customers</p>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i < step ? "bg-primary-400 text-white" : i === step ? "bg-dark text-white" : "bg-gray-200 text-gray-400"}`}>
                {i < step ? "✓" : i+1}
              </div>
              <span className={`text-sm font-medium ${i === step ? "text-gray-900" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 mb-4">Provider profile</h2>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Full name / business name</label>
                <input value={form.name} onChange={set("name")} placeholder="e.g. Nimal Jayasuriya"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Service category</label>
                <select value={form.category} onChange={set("category")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition bg-white">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Service description</label>
                <textarea value={form.description} onChange={set("description")} rows={4}
                  placeholder="Describe your experience, qualifications, and what you offer…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition resize-none" />
              </div>
            </div>
          )}

          {/* Step 1: Listing */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 mb-4">Listing details</h2>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Pricing model</label>
                <div className="grid grid-cols-3 gap-3">
                  {["hourly","fixed","quotation"].map(p => (
                    <button key={p} onClick={() => setForm(f=>({...f, pricing:p}))}
                      className={`py-2.5 rounded-xl text-xs font-medium border transition capitalize ${form.pricing === p ? "bg-dark text-white border-dark" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {form.pricing !== "quotation" && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Price (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rs.</span>
                    <input type="number" value={form.price} onChange={set("price")} placeholder="e.g. 2500"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-primary-400 transition" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5 flex items-center gap-1"><MapPin size={11} /> Service area</label>
                <input value={form.area} onChange={set("area")} placeholder="e.g. Colombo, Nugegoda, Dehiwala"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 transition" />
              </div>
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-medium text-gray-700 mb-1">Upload portfolio photos</p>
                <p className="text-xs text-gray-400">Up to 10 photos · JPG, PNG</p>
                <button className="mt-3 bg-white border border-gray-200 text-sm text-gray-600 px-4 py-2 rounded-lg hover:border-primary-400 transition">Choose files</button>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 mb-1">Identity verification</h2>
              <p className="text-sm text-gray-500 mb-4">Upload your NIC to get verified. This is required before your listing goes live.</p>

              {[
                { key:"nic", label:"National Identity Card (NIC)", required:true },
                { key:"cert", label:"Professional certification (optional)", required:false },
              ].map(doc => (
                <div key={doc.key} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                    {doc.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                  </div>
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${form[doc.key] ? "border-primary-400 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}>
                    {form[doc.key] ? (
                      <div className="flex items-center justify-center gap-2 text-primary-600">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">File selected</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
                        <button onClick={() => setForm(f => ({...f, [doc.key]: "mock-file.pdf"}))}
                          className="mt-2 text-xs text-primary-600 font-medium hover:text-primary-400">Select file</button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700">🔒 Your documents are encrypted and only viewed by our admin team for verification. They are never shared publicly.</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => step < 2 ? setStep(s => s+1) : setSubmitted(true)}
          className="w-full bg-primary-400 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm transition">
          {step < 2 ? "Continue →" : "Submit application"}
        </button>
      </div>
    </div>
  );
}
