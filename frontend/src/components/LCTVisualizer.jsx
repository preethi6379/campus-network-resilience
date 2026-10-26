/**
 * Graphical Link-Cut Tree & Splay Operation Stepper
 * Author: Preetika & Avanish Ayyappan
 */

import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Layers, Cpu, GitCommit } from "lucide-react";

export default function LCTVisualizer({ trace = [] }) {
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
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, trace.length]);

  if (!trace || trace.length === 0) {
    return (
      <div className="glass-panel p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Link-Cut Tree Operation Recorded Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Cut or restore any fiber link in the <strong>Campus Map</strong> or <strong>Simulation Center</strong> to generate an educational step-by-step trace of Splay Tree rotations.
        </p>
      </div>
    );
  }

  const step = trace[currentStepIndex] || trace[0];

  return (
    <div className="space-y-6">
      {/* Player Header Card */}
      <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Dynamic Forest Splay Stepper</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing Sleator & Tarjan's Auxiliary Splay Tree operations executing in <strong>amortized O(log V)</strong> time.
          </p>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentStepIndex === 0}
            className="btn-action-outline p-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-action-primary text-xs py-1.5 px-3"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.min(trace.length - 1, prev + 1));
            }}
            disabled={currentStepIndex === trace.length - 1}
            className="btn-action-outline p-1.5"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-cyan-400 ml-2">
            {currentStepIndex + 1} / {trace.length}
          </span>
        </div>
      </div>

      {/* Visual Step Display */}
      <div className="glass-panel-glow p-6 space-y-6">
        {/* Step Badge & Target */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {step.operation.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-slate-400">
              Target Entity: <strong className="text-white font-mono">{step.target}</strong>
            </span>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            Amortized: O(log V)
          </span>
        </div>

        {/* Graphical Representation of Splay / Tree Step */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Explanation Card */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Operation Mechanics:</h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {step.explanation}
            </p>
            {step.details && Object.keys(step.details).length > 0 && (
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs font-mono grid grid-cols-2 gap-2 text-slate-300">
                {Object.entries(step.details).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-500">{k}: </span>
                    <span className="text-cyan-300 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Rotation Diagram Card */}
          <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Auxiliary Splay Tree State
            </div>
            <div className="py-6 flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center font-bold text-cyan-300 shadow-lg shadow-cyan-500/30 text-xs font-mono">
                {step.target.split("_")[0] || "NODE"}
              </div>
              <div className="text-slate-600 font-bold">➔</div>
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center font-bold text-indigo-300 shadow-lg shadow-indigo-500/30 text-xs font-mono">
                ROOT
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Rotated node to auxiliary tree root to preserve logarithmic depth.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
