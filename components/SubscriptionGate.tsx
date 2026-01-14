
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Rocket, CreditCard, 
  Key, ArrowRight, Activity, Loader2, X,
  Lock, Terminal, Server, ExternalLink, AlertTriangle,
  Copy, Crown, Minus, Square, Calendar, Smartphone,
  Landmark, Wallet
} from 'lucide-react';
import { userService } from '../services/userService';
import { StudyProfile } from '../types';

interface SubscriptionGateProps {
  userId: string;
  profile: StudyProfile;
  onSuccess: (newProfile: StudyProfile) => void;
  onClose?: () => void;
}

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ userId, profile, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Key provided by user
  const RAZORPAY_KEY_ID = 'rzp_test_S3dct6hWdTm4Tu';

  const handlePayment = async (method: 'upi' | 'card' | 'netbanking') => {
    setError(null);
    setLoading(true);
    setSelectedMethod(method);

    try {
      const res = await loadRazorpayScript();
      
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      if (!(window as any).Razorpay) {
         throw new Error('Razorpay SDK loaded but not found in window object.');
      }

      // Try to create order on server, fall back to client-side if server fails (for local testing)
      let orderOptions: any = {};
      try {
        const orderRes = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Check if response is actually JSON (avoid HTML fallback from SPA router)
        const contentType = orderRes.headers.get("content-type");
        if (orderRes.ok && contentType && contentType.indexOf("application/json") !== -1) {
            const orderData = await orderRes.json();
            if (orderData.id) {
                orderOptions = {
                    order_id: orderData.id,
                    amount: orderData.amount,
                    currency: orderData.currency,
                };
            }
        } else {
            console.warn("Backend API not reachable or returned HTML. Switching to Client-Side Test Mode.");
            // Silent fallback
        }
      } catch (apiError) {
        console.log("Using fallback payment options (Local/Offline Mode)");
      }

      // Fallback options if API failed
      if (!orderOptions.order_id) {
          orderOptions = {
            amount: 9900,
            currency: "INR",
          };
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        name: "GATEONAUT",
        description: "Monthly Pro Access",
        image: "https://ui-avatars.com/api/?name=G&background=000&color=fff",
        ...orderOptions,
        handler: async function (response: any) {
            // 3. Verify Payment on Server
            try {
                // If we have an order_id, verify it. If not (fallback), just approve for now.
                if (response.razorpay_order_id && orderOptions.order_id) {
                    const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });
                    
                    const verifyData = await verifyRes.json();
                    if (!verifyData.success) {
                        throw new Error("Signature verification failed.");
                    }
                }
                
                // Success Flow
                const updatedProfile = await userService.processPayment(userId, profile);
                onSuccess(updatedProfile);

            } catch (e: any) {
                console.error(e);
                alert("Verification Warning: " + e.message);
                // For UX, we might still allow it if it was a client-side fallback
                if (!orderOptions.order_id) {
                    const updatedProfile = await userService.processPayment(userId, profile);
                    onSuccess(updatedProfile);
                }
            }
        },
        prefill: {
            name: "Cadet",
            email: "cadet@gateonaut.com",
            contact: "9999999999",
            method: method // Attempt to hint method
        },
        notes: {
            address: "Gateonaut HQ"
        },
        theme: {
            color: "#f59e0b" // Amber color to match UI
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
                setSelectedMethod(null);
            }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        setError(`Transaction Failed: ${response.error.description || response.error.reason}`);
        setLoading(false);
        setSelectedMethod(null);
      });
      rzp1.open();

    } catch (e: any) {
      console.error("Payment Error:", e);
      setError(e.message || "System Malfunction during initialization.");
      setLoading(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-mono-tech select-none">
      
      {/* Detached Window Container */}
      <div className="w-full max-w-4xl bg-[#020617] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-700 flex flex-col overflow-hidden relative transform transition-all duration-300 scale-100 hover:shadow-[0_0_60px_rgba(var(--color-primary-500),0.1)]">
        
        {/* OS-like Title Bar */}
        <div className="h-9 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 select-none cursor-move">
           <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                 <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center group">
                    <X size={8} className="text-red-900 opacity-0 group-hover:opacity-100" />
                 </button>
                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                 <Terminal size={10} />
                 GATEONAUT_PREMIUM_ACCESS.EXE
              </span>
           </div>
           <div className="text-[9px] text-slate-600 font-bold uppercase">
              Encrypted Tunnel
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row h-auto md:h-[550px]">
           
           {/* Left: The Pitch */}
           <div className="md:w-5/12 bg-slate-950 p-8 flex flex-col justify-between border-r border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/30 mb-6">
                    <Crown size={24} className="text-amber-500" />
                 </div>
                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                    God Mode
                 </h2>
                 <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Stop playing the trial version of your life. Unlock the tools to actually clear GATE.
                 </p>
              </div>

              <div className="space-y-5 relative z-10">
                 {[
                    { text: 'AI Strategy Engine', sub: 'Calculated success.' },
                    { text: 'Unlimited Trauma Dump', sub: 'Log every breakdown.' },
                    { text: 'Full Syllabus Access', sub: 'No more locked doors.' },
                 ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                       <div className="p-1 rounded bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                          <ShieldCheck size={14} />
                       </div>
                       <div>
                          <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">{item.text}</div>
                          <div className="text-[9px] text-slate-600 font-bold">{item.sub}</div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="relative z-10 pt-6 border-t border-slate-800">
                 <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">₹99</span>
                    <span className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase">/ Month</span>
                 </div>
                 <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-wide">
                    Price of a pizza. <br/> Value of your future.
                 </p>
              </div>
           </div>

           {/* Right: The Payment Interface */}
           <div className="flex-1 bg-slate-900 p-8 flex flex-col relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/5 rounded-bl-full blur-3xl pointer-events-none"></div>

              <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
                 
                 <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Zap size={14} className="text-amber-500" /> Select Payment Vector
                    </h3>
                    <p className="text-[10px] text-slate-600 font-bold uppercase">Choose how you want to part with your money.</p>
                 </div>

                 {error && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-left flex items-start gap-2 animate-pulse">
                       <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                       <p className="text-[10px] text-red-200 leading-tight font-bold">{error}</p>
                    </div>
                 )}

                 <div className="grid grid-cols-1 gap-4">
                    {/* UPI Option */}
                    <button 
                       onClick={() => handlePayment('upi')}
                       disabled={loading}
                       className="group relative overflow-hidden bg-slate-950 border border-slate-800 hover:border-emerald-500 p-4 rounded-xl transition-all text-left flex items-center justify-between shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                             <Smartphone size={20} />
                          </div>
                          <div>
                             <div className="text-xs font-black text-white uppercase tracking-wider">UPI / QR</div>
                             <div className="text-[9px] text-slate-500 font-bold group-hover:text-emerald-500/70 transition-colors">Instant Approval</div>
                          </div>
                       </div>
                       {selectedMethod === 'upi' && loading ? <Loader2 size={18} className="animate-spin text-emerald-500" /> : <ArrowRight size={16} className="text-slate-700 group-hover:text-white transition-transform group-hover:translate-x-1" />}
                       <div className="absolute inset-0 bg-emerald-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>

                    {/* Card Option */}
                    <button 
                       onClick={() => handlePayment('card')}
                       disabled={loading}
                       className="group relative overflow-hidden bg-slate-950 border border-slate-800 hover:border-amber-500 p-4 rounded-xl transition-all text-left flex items-center justify-between shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors">
                             <CreditCard size={20} />
                          </div>
                          <div>
                             <div className="text-xs font-black text-white uppercase tracking-wider">Plastic Money</div>
                             <div className="text-[9px] text-slate-500 font-bold group-hover:text-amber-500/70 transition-colors">Credit / Debit</div>
                          </div>
                       </div>
                       {selectedMethod === 'card' && loading ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <ArrowRight size={16} className="text-slate-700 group-hover:text-white transition-transform group-hover:translate-x-1" />}
                       <div className="absolute inset-0 bg-amber-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>

                    {/* NetBanking Option */}
                    <button 
                       onClick={() => handlePayment('netbanking')}
                       disabled={loading}
                       className="group relative overflow-hidden bg-slate-950 border border-slate-800 hover:border-blue-500 p-4 rounded-xl transition-all text-left flex items-center justify-between shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/50 transition-colors">
                             <Landmark size={20} />
                          </div>
                          <div>
                             <div className="text-xs font-black text-white uppercase tracking-wider">Boomer Banking</div>
                             <div className="text-[9px] text-slate-500 font-bold group-hover:text-blue-500/70 transition-colors">NetBanking</div>
                          </div>
                       </div>
                       {selectedMethod === 'netbanking' && loading ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <ArrowRight size={16} className="text-slate-700 group-hover:text-white transition-transform group-hover:translate-x-1" />}
                       <div className="absolute inset-0 bg-blue-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>
                 </div>

              </div>

              <div className="mt-auto flex justify-between items-center border-t border-slate-800 pt-6">
                 <div className="flex items-center gap-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest opacity-60">
                    <span className="flex items-center gap-1"><Server size={10} /> Razorpay Secure</span>
                    <span className="flex items-center gap-1"><Lock size={10} /> 256-bit SSL</span>
                 </div>
                 
                 <div className="text-[9px] text-slate-600 font-mono">
                    SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGate;
