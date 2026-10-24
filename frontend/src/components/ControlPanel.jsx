/**
 * Network Resilience Control Panel & Disaster Simulation
 * Author: Preetika (Frontend Lead)
 */

import React, { useState } from "react";
import { AlertOctagon, RefreshCw, GitBranch, RotateCcw, RotateCw, Network, Zap } from "lucide-react";

export default function ControlPanel({
  links = [],
  nodes = [],
  selectedLinkId,
  onSelectLink,
  onFailLink,
  onRestoreLink,
  onRequestRecovery,
  recoveryCandidates = [],
  onApplyRecovery,
  onUndo,
  onRedo,
  onCheckConnectivity,
  connectivityResult,
  loading = false
}) {
  const [sourceNode, setSourceNode] = useState("NODE_GW");
  const [targetNode, setTargetNode] = useState("NODE_LMS_SRV");
  const [severity, setSeverity] = useState("HIGH");

  const selectedLink = links.find((l) => l.id === selectedLinkId);

  const handleConnectivityCheck = (e) => {
    e.preventDefault();
    if (onCheckConnectivity) {
      onCheckConnectivity(sourceNode, targetNode);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-slate-100">Resilience Operations & Simulation</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onUndo}
            disabled={loading}
            title="Undo last mutation"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={loading}
            title="Redo undone mutation"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition disabled:opacity-50"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Link Selection & Failure Simulation */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
          Target Network Link
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={selectedLinkId || ""}
            onChange={(e) => onSelectLink(e.target.value)}
            className="col-span-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="">-- Click link on graph or select here --</option>
            {links.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} ({l.source} ➔ {l.target}) [{l.status}]
              </option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2"
          >
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>

        {selectedLink && (
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Selected:</span>
              <span className="font-mono text-cyan-400 font-semibold">{selectedLink.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Endpoints:</span>
              <span>{selectedLink.source} ➔ {selectedLink.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Properties:</span>
              <span>Latency: {selectedLink.latency_ms}ms | Cost: {selectedLink.cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-semibold ${selectedLink.status === 'ACTIVE' ? 'text-cyan-400' : selectedLink.status === 'FAILED' ? 'text-red-400' : 'text-emerald-400'}`}>
                {selectedLink.status} {selectedLink.is_tree_edge ? '(Primary Tree Edge)' : '(Standby Backup)'}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => onFailLink(selectedLinkId, severity)}
            disabled={!selectedLinkId || loading || (selectedLink && selectedLink.status === "FAILED")}
            className="flex-1 min-w-[140px] px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-40 disabled:hover:bg-rose-600 flex items-center justify-center gap-1.5"
          >
            <AlertOctagon className="w-4 h-4" />
            Fail Link (Cut LCT)
          </button>

          <button
            onClick={() => onRestoreLink(selectedLinkId)}
            disabled={!selectedLinkId || loading || (selectedLink && selectedLink.status === "ACTIVE")}
            className="flex-1 min-w-[140px] px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-40 disabled:hover:bg-cyan-600 flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Original
          </button>

          <button
            onClick={onRequestRecovery}
            disabled={loading}
            className="flex-1 min-w-[140px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <GitBranch className="w-4 h-4" />
            Find Recovery Routes
          </button>
        </div>
      </div>

      {/* Candidate Recovery Alternatives */}
      {recoveryCandidates.length > 0 && (
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Valid Candidate Alternative Routes
            </span>
            <span className="text-[11px] text-slate-400">Ranked by minimum latency/cost</span>
          </div>

          <div className="space-y-2">
            {recoveryCandidates.map((c) => (
              <div
                key={c.link_id}
                className="p-3 bg-slate-950 border border-emerald-900/40 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-emerald-300 font-mono">{c.link_id}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {c.source_name} ➔ {c.target_name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Latency: {c.latency_ms}ms | Cost: {c.cost} | Score: {c.score}
                  </div>
                </div>
                <button
                  onClick={() => onApplyRecovery(c.link_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow transition"
                >
                  Activate Backup
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic O(log V) Connectivity Inspector */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            LCT Dynamic Path & Connectivity Query [O(log V)]
          </span>
        </div>

        <form onSubmit={handleConnectivityCheck} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={sourceNode}
            onChange={(e) => setSourceNode(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-2"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                From: {n.name}
              </option>
            ))}
          </select>

          <select
            value={targetNode}
            onChange={(e) => setTargetNode(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-2"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                To: {n.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-semibold text-xs rounded-lg transition"
          >
            Query Path
          </button>
        </form>

        {connectivityResult && (
          <div className={`p-3 rounded-lg border text-xs ${connectivityResult.connected ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-rose-950/20 border-rose-900/40 text-rose-300'}`}>
            <div className="font-semibold flex items-center gap-1.5">
              <span>{connectivityResult.connected ? "✔ Component Connected" : "✖ Partitioned / Disconnected"}</span>
              <span className="text-[10px] text-slate-400 font-normal">via find_root() in O(log V)</span>
            </div>
            {connectivityResult.connected && connectivityResult.path_metrics && (
              <div className="text-[11px] text-slate-300 mt-1 space-x-3">
                <span>Aggregate Path Latency: <strong>{connectivityResult.path_metrics.path_latency_sum}ms</strong></span>
                <span>Bottleneck Max: <strong>{connectivityResult.path_metrics.path_max_latency}ms</strong></span>
                <span>Hops: <strong>{connectivityResult.path_metrics.path_node_count}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
