/**
 * Dynamic Path & Latency Ping Radar
 * Author: Preetika & Avanish Ayyappan
 */

import React, { useState } from "react";
import { Network, ArrowRight, Gauge, CheckCircle2, WifiOff, Zap } from "lucide-react";

export default function PathRadar({ nodes = [], onCheckConnectivity, connectivityResult, loading = false }) {
  const [source, setSource] = useState("NODE_GW");
  const [target, setTarget] = useState("NODE_LMS_SRV");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCheckConnectivity) {
      onCheckConnectivity(source, target);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 space-y-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Dynamic Path & Latency Radar (O(log V))
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Queries path reachability and computes aggregated latency using the Link-Cut Tree in amortized <strong>O(log V)</strong> time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Origin Node
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-cyan-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center text-slate-500 pt-5">
            <ArrowRight className="w-5 h-5 hidden sm:block" />
          </div>

          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Destination Node
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-cyan-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-7 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-action-primary w-full justify-center py-3 text-sm font-semibold"
            >
              <Zap className="w-4 h-4" /> Run Dynamic Path Ping [O(log V)]
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {connectivityResult && (
        <div
          className={`p-6 rounded-2xl border transition ${
            connectivityResult.connected
              ? "bg-slate-950/80 border-emerald-500/40 shadow-xl shadow-emerald-950/20"
              : "bg-slate-950/80 border-rose-500/40 shadow-xl shadow-rose-950/20"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {connectivityResult.connected ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <WifiOff className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-white">
                  {connectivityResult.connected ? "Active Route Connected" : "Network Partition Disconnected"}
                </h4>
                <div className="text-xs text-slate-400">
                  {connectivityResult.source} ➔ {connectivityResult.target}
                </div>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
              Verified in O(log V)
            </span>
          </div>

          {connectivityResult.connected && connectivityResult.path_metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Path Latency</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {connectivityResult.path_metrics.path_latency_sum} ms
                </div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Bottleneck Latency</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                  {connectivityResult.path_metrics.path_max_latency} ms
                </div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Nodes in Path</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                  {connectivityResult.path_metrics.path_node_count} Hops
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
