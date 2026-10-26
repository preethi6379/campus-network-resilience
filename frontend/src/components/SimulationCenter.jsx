/**
 * Resilience & Disaster Simulation Center
 * Half-White / Ivory Cream Theme with Burgundy Typography
 * Authors: Preetika & Avanish Ayyappan
 */

import React from "react";
import {
  Server,
  Zap,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  RotateCcw,
  RotateCw,
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
    <div className="space-y-6 bg-[#FAF7F2] p-6 rounded-2xl border border-[rgba(86,28,36,0.15)] shadow-xl text-[#561C24]">
      {/* 1. Real-Time Service Availability Board */}
      <div className="bg-white p-5 rounded-2xl border border-[rgba(86,28,36,0.15)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(86,28,36,0.1)] pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#6D2932]" />
            <h3 className="font-bold text-[#561C24] text-base">Campus Cloud Services Availability</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {availableServices.length} Operational
            </span>
            {impactedServices.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
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
              className="p-4 rounded-xl bg-[#FDFBF9] border border-[rgba(86,28,36,0.12)] hover:border-[#6D2932] transition space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ONLINE
                </span>
              </div>
              <div className="font-semibold text-[#561C24] text-sm">{srv.name}</div>
              <div className="text-[11px] text-[#7A3E47] line-clamp-1">{srv.description}</div>
            </div>
          ))}

          {/* Impacted Services */}
          {impactedServices.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-xl bg-rose-50 border border-rose-300 shadow-md space-y-2 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                  OUTAGE
                </span>
              </div>
              <div className="font-semibold text-rose-900 text-sm">{srv.name}</div>
              <div className="text-[11px] text-rose-700">
                Disconnected: {srv.missing_nodes?.join(", ") || "Core Gateway"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Emergency Recovery Dispatcher */}
      {impactedServices.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <AlertOctagon className="w-5 h-5 text-amber-600" />
              Emergency Resilience Dispatcher
            </div>
            <button
              onClick={onRequestRecovery}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Scan Redundant Fiber
            </button>
          </div>

          <p className="text-xs text-amber-800">
            A network partition was detected. The system scanned for available redundant standby fiber lines capable of restoring full connectivity in O(log V) time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recoveryCandidates.map((c) => (
              <div
                key={c.link_id}
                className="p-4 rounded-xl bg-white border border-emerald-300 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-800">{c.link_id}</div>
                  <div className="text-xs text-[#561C24] font-medium mt-1">
                    {c.source_name} ➔ {c.target_name}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Latency: <strong className="text-[#561C24]">{c.latency_ms}ms</strong> | Cost: <strong className="text-[#561C24]">{c.cost}</strong>
                  </div>
                </div>
                <button
                  onClick={() => onApplyRecovery(c.link_id)}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Deploy Backup
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Interactive Fiber Link Control Rack */}
      <div className="bg-white p-5 rounded-2xl border border-[rgba(86,28,36,0.15)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(86,28,36,0.1)] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6D2932]" />
            <h3 className="font-bold text-[#561C24] text-base">Campus Fiber Links Control Rack</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={loading}
              title="Undo last mutation"
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#561C24] border border-[rgba(86,28,36,0.2)] rounded-lg text-xs font-semibold transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={onRedo}
              disabled={loading}
              title="Redo mutation"
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#561C24] border border-[rgba(86,28,36,0.2)] rounded-lg text-xs font-semibold transition flex items-center gap-1"
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
                  ? "bg-rose-50/70 border-rose-300"
                  : link.status === "RECOVERED"
                  ? "bg-emerald-50/70 border-emerald-300"
                  : "bg-[#FDFBF9] border-[rgba(86,28,36,0.15)]"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#561C24]">{link.id}</span>
                <span
                  className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                    link.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : link.status === "FAILED"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : link.status === "RECOVERED"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {link.status}
                </span>
              </div>

              <div className="text-xs text-[#561C24] mt-2 font-medium">
                {link.source} ➔ {link.target}
              </div>

              <div className="text-[11px] text-[#7A3E47] mt-1 flex justify-between">
                <span>Latency: {link.latency_ms}ms</span>
                <span>{link.is_tree_edge ? "Primary Backbone" : "Standby Route"}</span>
              </div>

              <div className="mt-3 pt-2 border-t border-[rgba(86,28,36,0.1)] flex gap-2">
                {link.status !== "FAILED" ? (
                  <button
                    onClick={() => onFailLink(link.id, "HIGH")}
                    disabled={loading}
                    className="flex-1 py-1.5 px-3 bg-[#881337] hover:bg-[#9F1239] text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Zap className="w-3 h-3" /> Cut Cable
                  </button>
                ) : (
                  <button
                    onClick={() => onRestoreLink(link.id)}
                    disabled={loading}
                    className="flex-1 py-1.5 px-3 bg-[#561C24] hover:bg-[#6D2932] text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 shadow-sm"
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
