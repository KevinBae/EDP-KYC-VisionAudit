import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, TrendingUp, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Activity, RotateCcw,
  Database, FileText, Cpu
} from 'lucide-react';

// --- Sub-components ---

// A horizontal bar showing risk probability
const RiskBar = ({ probability }) => {
  const isLow = probability <= 25;
  const isMed = probability <= 60;
  const color = isLow ? '#10b981' : isMed ? '#f59e0b' : '#f43f5e';
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">Termination Probability</span>
        <span className="text-xs font-black" style={{ color }}>{probability}%</span>
      </div>
      <div className="h-1.5 bg-slate-900/60 rounded-full overflow-hidden p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Individual finding row (Full Width)
const FindingRow = ({ detail, index }) => {
  const [expanded, setExpanded] = useState(detail.status !== 'success');
  const isPass = detail.pass;
  const isWarn = detail.status === 'warning';

  const statusColor = isPass ? 'text-emerald-400' : isWarn ? 'text-amber-400' : 'text-rose-400';
  const bgColor = isPass ? 'bg-emerald-500/5' : isWarn ? 'bg-amber-500/5' : 'bg-rose-500/5';
  const borderColor = isPass ? 'border-emerald-500/10' : isWarn ? 'border-amber-500/10' : 'border-rose-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden cursor-pointer select-none transition-all hover:bg-slate-700/20`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${isPass ? 'bg-emerald-500/10 text-emerald-400' : isWarn ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isPass ? <CheckCircle2 className="w-4 h-4" /> : isWarn ? <AlertCircle className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest leading-none">{detail.label}</span>
              {detail.riskProbability !== undefined && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${statusColor} bg-current/10 uppercase tracking-tighter`}>
                  {detail.riskProbability}% Risk
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{detail.note}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:block text-right">
             <div className="text-[9px] text-slate-600 uppercase font-black mb-0.5 tracking-widest">Signal Clarity</div>
             <div className={`text-xs font-black ${statusColor}`}>{isPass ? 'High Confidence' : isWarn ? 'Advisory' : 'Critical Failure'}</div>
          </div>
          <div className="text-slate-600">
            {detail.riskContext ? (expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : null}
          </div>
        </div>
      </div>

      {expanded && detail.riskContext && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4 border-t border-slate-700/30 bg-slate-900/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {detail.riskContext}
              </p>
            </div>
            {detail.riskProbability !== undefined && (
              <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-700/20">
                <RiskBar probability={detail.riskProbability} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Main Scorecard Component ---
const Scorecard = ({ url, onRestart, auditData }) => {
  if (!auditData) return null;

  const scoreMap = { success: 100, warning: 50, danger: 0 };
  const scorableResults = auditData.results.filter(r => r.id !== 'summary' && r.status in scoreMap);
  const totalScore = Math.round(
    scorableResults.reduce((acc, res) => acc + scoreMap[res.status], 0) / scorableResults.length
  );

  const criticalCount = auditData.results.find(r => r.id === 'summary')?.criticalCount || 0;
  const isHighRisk = totalScore < 50;

  const getUIStatus = (status) => status === 'success' ? 'pass' : status === 'warning' ? 'warning' : 'fail';

  const scoreColor = totalScore >= 80 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : '#f43f5e';
  const scoreLabel = totalScore >= 80 ? 'Low Risk' : totalScore >= 50 ? 'Elevated Risk' : 'High Risk';

  // Compute overall termination probability across all findings
  const allDetails = auditData.results
    .filter(r => r.id !== 'summary' && r.details)
    .flatMap(r => r.details);
  
  const avgRiskProb = allDetails.length
    ? Math.round(allDetails.reduce((acc, d) => {
        const val = Number(d.riskProbability);
        return acc + (isNaN(val) ? 0 : val);
      }, 0) / allDetails.length)
    : null;

  const sections = [
    {
      id: 'legal',
      title: 'Legal Disclosures',
      icon: <FileText className="w-5 h-5 text-violet-400" />,
      status: getUIStatus(auditData.results.find(r => r.id === 'footer')?.status),
      details: (auditData.results.find(r => r.id === 'footer')?.details || []).map(d => ({
        label: d.label, pass: d.status === 'success', note: d.note, status: d.status,
        riskProbability: d.riskProbability, riskContext: d.riskContext
      }))
    },
    {
      id: 'marketing',
      title: 'Regulatory & FTC Risk',
      icon: <Activity className="w-5 h-5 text-rose-400" />,
      status: getUIStatus(auditData.results.find(r => r.id === 'marketing')?.status),
      details: (auditData.results.find(r => r.id === 'marketing')?.details || []).map(d => ({
        label: d.label, pass: d.status === 'success', note: d.note, status: d.status,
        riskProbability: d.riskProbability, riskContext: d.riskContext
      }))
    },
    {
      id: 'technical',
      title: 'Technical Security',
      icon: <Cpu className="w-5 h-5 text-sky-400" />,
      status: getUIStatus(auditData.results.find(r => r.id === 'tech')?.status),
      details: (auditData.results.find(r => r.id === 'tech')?.details || []).map(d => ({
        label: d.label, pass: d.status === 'success', note: d.note, status: d.status,
        riskProbability: d.riskProbability, riskContext: d.riskContext
      }))
    }
  ];

  const statusColors = {
    pass: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    fail: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-6 pb-20 px-4 sm:px-0"
    >
      {/* ── Consolidated Dashboard Header ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-black/40"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Column 1: Domain & Context */}
          <div className="lg:col-span-3 lg:border-r border-slate-700/40 pr-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 shadow-inner">
                <Database className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Scanned Asset</div>
                <div className="text-xl font-black text-slate-100 truncate tracking-tight">{url.replace(/^https?:\/\//, '')}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pl-14">
              Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Column 2: Core Metrics */}
          <div className="lg:col-span-5 flex items-center justify-around">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Confidence</div>
              <div className="text-5xl font-black tracking-tighter" style={{ color: scoreColor }}>
                {totalScore}<span className="text-xl text-slate-600 font-normal">/100</span>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-700/40" />
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Rejection Risk</div>
              <div className="text-5xl font-black tracking-tighter" style={{ color: avgRiskProb > 50 ? '#f43f5e' : avgRiskProb > 25 ? '#f59e0b' : '#10b981' }}>
                {avgRiskProb || 0}<span className="text-xl text-slate-600 font-normal">%</span>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-700/40" />
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Assessment</div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider" style={{ color: scoreColor }}>
                  {isHighRisk ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {scoreLabel}
                </div>
                <div className="px-3 py-0.5 rounded-full bg-slate-700/40 border border-slate-600/30 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   {criticalCount} Critical Flags
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Immediate Actions */}
          <div className="lg:col-span-4 flex flex-col gap-3 lg:pl-6 lg:border-l border-slate-700/40">
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-black transition-all shadow-xl shadow-teal-500/20 active:scale-95"
            >
              <Activity className="w-4 h-4" />
              SCHEDULE RISK CONSULTATION
            </a>
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-700/30 hover:bg-slate-700 hover:text-white border border-slate-600/50 text-slate-300 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              INITIATE NEW SCAN
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="mt-6 pt-4 border-t border-slate-700/40">
          <div className="flex justify-between items-end mb-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Aggregate Underwriter Confidence Index</div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 mr-2 uppercase font-black">Probability:</span>
              <span className="text-xs font-black" style={{ color: avgRiskProb > 50 ? '#f43f5e' : avgRiskProb > 25 ? '#f59e0b' : '#10b981' }}>{avgRiskProb || 0}%</span>
            </div>
          </div>
          <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden p-0.5 border border-slate-700/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${avgRiskProb || 0}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)]"
              style={{ backgroundColor: avgRiskProb > 50 ? '#f43f5e' : avgRiskProb > 25 ? '#f59e0b' : '#10b981' }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Unified Analytical Report Card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm"
      >
        <div className="divide-y divide-slate-700/40">
          {sections.map((section, idx) => {
            const sc = statusColors[section.status] || statusColors.fail;
            const passCount = section.details.filter(d => d.pass).length;
            const totalCount = section.details.length;
            const pct = Math.round((passCount / totalCount) * 100);

            return (
              <div key={section.id} className="p-6 sm:p-10 space-y-8">
                {/* Section Horizontal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-2xl border ${sc.border} ${sc.bg} ${sc.text} shadow-xl shadow-black/20`}>
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-50 uppercase tracking-tighter">{section.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 font-mono">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Scanned Integrity: {pct}%</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Node Count: {passCount}/{totalCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`self-start sm:self-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${sc.border} ${sc.bg} ${sc.text} shadow-lg backdrop-blur-md`}>
                    {section.status === 'pass' ? 'AUTHENTICATED' : section.status === 'warning' ? 'ELEVATED RISK PROFILE' : 'CRITICAL SYSTEM FAILURE'}
                  </div>
                </div>

                {/* Vertical Data-Science Stack (Spans Full Width) */}
                <div className="space-y-4">
                  {section.details.map((detail, dIdx) => (
                    <FindingRow key={dIdx} detail={detail} index={dIdx} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Unified Report Footer */}
        <div className="bg-slate-900/40 p-8 border-t border-slate-700/40 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-px bg-slate-700" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] leading-relaxed">
              Synthesized Underwriter Analysis · Verified Merchant Acquirer Benchmarks
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Scorecard;
