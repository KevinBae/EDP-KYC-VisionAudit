import React, { useState } from 'react';
import { ShieldCheck, Search, Activity, Lock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Scorecard from './components/Scorecard';

function App() {
  const [url, setUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [showScorecard, setShowScorecard] = useState(false);
  const [auditData, setAuditData] = useState(null);

  const auditSteps = [
    "Establishing secure connection...",
    "Analyzing legal disclosure signals...",
    "Running FTC & regulatory pattern matching...",
    "Evaluating technical security posture...",
    "Compiling risk probability model..."
  ];

  const handleRunAudit = async () => {
    if (!url) return;
    setIsAuditing(true);
    setShowScorecard(false);
    setAuditStep(0);
    setAuditData(null);

    // Visual step sequence
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < auditSteps.length - 1) {
        setAuditStep(step);
      }
    }, 1000);

    try {
      const response = await fetch('https://edp-kyc-visionaudit.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Backend connection failed");
      const data = await response.json();
      setAuditData(data);

      clearInterval(stepInterval);
      setAuditStep(auditSteps.length - 1); // Final 'Compiling...' step

      setTimeout(() => {
        setIsAuditing(false);
        setShowScorecard(true);
      }, 1200);

    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
      setIsAuditing(false);
      alert("Failed to connect to the EPD Audit engine. Check if the server is running on port 3000.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500/30">
      {/* Navbar Minimal */}
      <nav className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" 
          onClick={() => {
            setShowScorecard(false);
            setIsAuditing(false);
            setUrl('');
          }}
        >
          <ShieldCheck className="w-8 h-8 text-teal-400" />
          <span className="text-xl font-bold tracking-tight text-white">EPD <span className="text-teal-400 font-light">Auditor</span></span>
        </div>
        <div className="text-sm text-slate-400">Technical Trust & Compliance</div>
      </nav>

      <main className="container mx-auto px-4 py-16 flex flex-col items-center">
        {/* Hero Section */}
        <AnimatePresence mode="wait">
          {!showScorecard ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl flex flex-col items-center mt-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-8">
                <Activity className="w-4 h-4" />
                <span>Statistical Risk Engine · 12-Dimension Analysis</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl text-center font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Merchant Risk Analysis
                <br className="hidden md:block" />
                <span className="text-teal-400">Powered by Data</span>
              </h1>
              
              <p className="text-lg text-slate-400 text-center mb-12 max-w-2xl leading-relaxed">
                Quantify your payment processor termination risk across legal, regulatory, and technical dimensions — before your underwriter does.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-8 mb-12 text-center">
                <div>
                  <div className="text-2xl font-black text-teal-400">76%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">of declines cite missing<br/>refund policy</div>
                </div>
                <div className="w-px h-10 bg-slate-700/60" />
                <div>
                  <div className="text-2xl font-black text-amber-400">83%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">KYC rejections: no<br/>physical address</div>
                </div>
                <div className="w-px h-10 bg-slate-700/60" />
                <div>
                  <div className="text-2xl font-black text-rose-400">81%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">undisclosed subscriptions<br/>face termination</div>
                </div>
              </div>

              <div className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row gap-3 bg-slate-800 p-3 rounded-2xl border border-slate-700/50 shadow-2xl">
                  <div className="relative flex-grow flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-slate-500" />
                    <input 
                      type="url" 
                      placeholder="https://example-merchant.com" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && url && !isAuditing) handleRunAudit(); }}
                      disabled={isAuditing}
                      className="w-full bg-slate-900/50 text-white placeholder-slate-500 rounded-xl py-4 pl-12 pr-4 outline-none border border-transparent focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all text-lg disabled:opacity-50"
                    />
                  </div>
                  <button 
                    onClick={handleRunAudit}
                    disabled={isAuditing || !url}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
                  >
                    {isAuditing ? (
                      <Search className="w-5 h-5 animate-pulse" />
                    ) : (
                      <>
                        Run Audit
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Display during animation */}
              <div className={`mt-6 transition-all duration-500 h-10 flex items-center justify-center ${isAuditing ? 'opacity-100' : 'opacity-0'}`}>
                {isAuditing && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-slate-400 bg-slate-800/60 px-5 py-2.5 rounded-lg border border-slate-700/60 text-sm font-mono"
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-teal-400 border-t-transparent animate-spin"></div>
                    <span>{auditSteps[auditStep]}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <Scorecard 
              key="scorecard" 
              url={url} 
              auditData={auditData}
              onRestart={() => setShowScorecard(false)} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
