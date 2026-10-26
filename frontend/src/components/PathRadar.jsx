/**
 * Dynamic Path & Latency Ping Radar
 * Half-White / Ivory Cream Theme with Burgundy Typography
 * Authors: Preetika & Avanish Ayyappan
 */

import React, { useState } from "react";
import { Network, ArrowRight, CheckCircle2, WifiOff, Zap } from "lucide-react";

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
    <div className="space-y-6 bg-[#FAF7F2] p-6 rounded-2xl border border-[rgba(86,28,36,0.15)] shadow-xl text-[#561C24]">
      {/* Ping Selector Card */}
      <div className="bg-white p-6 rounded-2xl border border-[rgba(86,28,36,0.15)] shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-[#561C24] text-base flex items-center gap-2">
            <Network className="w-5 h-5 text-[#6D2932]" />
            Dynamic Path & Latency Radar (O(log V))
          </h3>
          <p className="text-xs text-[#7A3E47] mt-1">
            Queries dynamic tree connectivity and aggregates latency metrics using the Link-Cut Tree in <strong>amortized O(log V)</strong> time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-[#7A3E47] uppercase tracking-wider block mb-1">
              Origin Campus Building
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[rgba(86,28,36,0.2)] text-[#561C24] text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#6D2932] focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center text-[#7A3E47] pt-5">
            <ArrowRight className="w-5 h-5 hidden sm:block" />
          </div>

          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-[#7A3E47] uppercase tracking-wider block mb-1">
              Destination Campus Building
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[rgba(86,28,36,0.2)] text-[#561C24] text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#6D2932] focus:outline-none"
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
              className="w-full py-3 bg-[#561C24] hover:bg-[#6D2932] text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Run Dynamic Path Ping [O(log V)]
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {connectivityResult && (
        <div
          className={`p-6 rounded-2xl border transition bg-white shadow-md ${
            connectivityResult.connected
              ? "border-emerald-300"
              : "border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[rgba(86,28,36,0.1)] pb-4">
            <div className="flex items-center gap-3">
              {connectivityResult.connected ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <WifiOff className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-[#561C24]">
                  {connectivityResult.connected ? "Active Fiber Route Connected" : "Network Partition Disconnected"}
                </h4>
                <div className="text-xs text-[#7A3E47]">
                  {connectivityResult.source} ➔ {connectivityResult.target}
                </div>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FAF7F2] border border-[rgba(86,28,36,0.2)] text-[#561C24] font-semibold">
              Computed in O(log V)
            </span>
          </div>

          {connectivityResult.connected && connectivityResult.path_metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[rgba(86,28,36,0.12)] text-center">
                <div className="text-[11px] text-[#7A3E47] uppercase font-semibold">Aggregate Path Latency</div>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                  {connectivityResult.path_metrics.path_latency_sum} ms
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[rgba(86,28,36,0.12)] text-center">
                <div className="text-[11px] text-[#7A3E47] uppercase font-semibold">Bottleneck Latency</div>
                <div className="text-2xl font-bold font-mono text-[#561C24] mt-1">
                  {connectivityResult.path_metrics.path_max_latency} ms
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[rgba(86,28,36,0.12)] text-center">
                <div className="text-[11px] text-[#7A3E47] uppercase font-semibold">Nodes in Path</div>
                <div className="text-2xl font-bold font-mono text-[#6D2932] mt-1">
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
