/**
 * Link-Cut Tree Step-by-Step Educational Stepper
 * Author: Preetika (Frontend Lead)
 */

import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";

export default function LCTViewer({ trace = [] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [trace]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && trace.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, trace.length]);

  if (!trace || trace.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-500 text-sm space-y-2">
        <Layers className="w-8 h-8 mx-auto text-slate-700" />
        <p>No LCT operation trace recorded yet.</p>
        <p className="text-xs text-slate-600">
          Trigger a link failure, restore, or query to step through the dynamic forest algorithm in O(log V) time.
        </p>
      </div>
    );
  }

  const step = trace[currentStepIndex] || trace[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-100">Link-Cut Tree (LCT) Educational Trace</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Step <span className="text-cyan-400 font-bold">{currentStepIndex + 1}</span> of {trace.length}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentStepIndex === 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "Pause" : "Auto-Play"}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.min(trace.length - 1, prev + 1));
            }}
            disabled={currentStepIndex === trace.length - 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-[200px] bg-slate-800 h-2 rounded-full overflow-hidden ml-4">
          <div
            className="bg-cyan-400 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / trace.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Active Step Details */}
      <div className="p-4 bg-slate-950/80 border border-cyan-900/40 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
            {step.operation.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-slate-400 font-mono">Target: <strong className="text-slate-200">{step.target}</strong></span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {step.explanation}
        </p>

        {step.details && Object.keys(step.details).length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
            {Object.entries(step.details).map(([k, v]) => (
              <div key={k} className="truncate">
                <span className="text-slate-500">{k}: </span>
                <span className="text-cyan-300">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complexity Note */}
      <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
        💡 <strong>Amortized Complexity:</strong> This step executes in <em>O(1)</em> rotations or preferred-child splices, maintaining the global invariant that all dynamic operations require amortized <strong>O(log V)</strong> time via the potential function $\Phi = \sum \log(\text{size}(v))$.
      </div>
    </div>
  );
}
