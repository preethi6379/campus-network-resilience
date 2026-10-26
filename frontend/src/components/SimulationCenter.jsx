/**
 * Resilience & Disaster Simulation Center
 * Author: Preetika & Avanish Ayyappan
 */

import React from "react";
import {
  Server,
  Zap,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  GitBranch,
  RotateCcw,
  RotateCw,
  Wifi,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export default function SimulationCenter({
  links = [],
  servicesStatus = null,
  recoveryCandidates = [],
  onFailLink,
  onRestoreLink,
  onRequestRecovery,
  onApplyRecovery,
  onUndo,
  onRedo,
  loading = false
}) {
  const availableServices = servicesStatus?.available || [];
  const impactedServices = servicesStatus?.impacted || [];

  return (
    <div className="space-y-6">
      {/* 1. Real-Time Service Availability LED Board */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Campus Cloud Services Availability</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {availableServices.length} Operational
            </span>
            {impactedServices.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                {impactedServices.length} Outages
              </span>
            )}
          </div>
        </div>

        {/* Visual Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Online Services */}
          {availableServices.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div className="font-semibold text-slate-100 text-sm">{srv.name}</div>
              <div className="text-[11px] text-slate-400 line-clamp-1">{srv.description}</div>
            </div>
          ))}

          {/* Impacted Services */}
          {impactedServices.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/60 shadow-lg shadow-rose-950/30 space-y-2 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  OUTAGE
                </span>
              </div>
              <div className="font-semibold text-rose-200 text-sm">{srv.name}</div>
              <div className="text-[11px] text-rose-300">
                Disconnected: {srv.missing_nodes?.join(", ") || "Core Gateway"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Emergency Recovery Dispatcher (Appears automatically when failure occurs) */}
      {impactedServices.length > 0 && (
        <div className="glass-panel-glow p-5 space-y-4 border-amber-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              Emergency Resilience Dispatcher
            </div>
            <button
              onClick={onRequestRecovery}
              disabled={loading}
              className="btn-action-outline text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Scan Redundant Fiber
            </button>
          </div>

          <p className="text-xs text-slate-300">
            A network partition was detected. The system scanned for available redundant standby fiber lines capable of restoring full connectivity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recoveryCandidates.map((c) => (
              <div
                key={c.link_id}
                className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400">{c.link_id}</div>
                  <div className="text-xs text-slate-200 font-medium mt-1">
                    {c.source_name} ➔ {c.target_name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Latency: <strong className="text-white">{c.latency_ms}ms</strong> | Cost: <strong className="text-white">{c.cost}</strong>
                  </div>
                </div>
                <button
                  onClick={() => onApplyRecovery(c.link_id)}
                  disabled={loading}
                  className="btn-action-success text-xs shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" /> Deploy Backup
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Interactive Fiber Link Control Rack */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Campus Fiber Links Control Rack</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={loading}
              title="Undo last action"
              className="btn-action-outline text-xs py-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={onRedo}
              disabled={loading}
              title="Redo action"
              className="btn-action-outline text-xs py-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Redo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {links.map((link) => (
            <div
              key={link.id}
              className={`p-3.5 rounded-xl border transition ${
                link.status === "FAILED"
                  ? "bg-rose-950/20 border-rose-900/60"
                  : link.status === "RECOVERED"
                  ? "bg-emerald-950/20 border-emerald-900/50"
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-200">{link.id}</span>
                <span
                  className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                    link.status === "ACTIVE"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : link.status === "FAILED"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : link.status === "RECOVERED"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {link.status}
                </span>
              </div>

              <div className="text-xs text-slate-300 mt-2 font-medium">
                {link.source} ➔ {link.target}
              </div>

              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Latency: {link.latency_ms}ms</span>
                <span>Type: {link.is_tree_edge ? "Primary Tree" : "Backup Link"}</span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex gap-2">
                {link.status !== "FAILED" ? (
                  <button
                    onClick={() => onFailLink(link.id, "HIGH")}
                    disabled={loading}
                    className="btn-action-danger flex-1 text-xs py-1.5 justify-center"
                  >
                    <Zap className="w-3 h-3" /> Cut Fiber
                  </button>
                ) : (
                  <button
                    onClick={() => onRestoreLink(link.id)}
                    disabled={loading}
                    className="btn-action-primary flex-1 text-xs py-1.5 justify-center"
                  >
                    <RefreshCw className="w-3 h-3" /> Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
