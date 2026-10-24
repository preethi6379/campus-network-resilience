/**
 * Campus Service Reachability & Impact Panel
 * Author: Preetika (Frontend Lead)
 */

import React from "react";
import { CheckCircle2, AlertTriangle, Server, WifiOff } from "lucide-react";

export default function ImpactPanel({ servicesStatus = null }) {
  if (!servicesStatus) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-400 text-sm">
        Loading service impact status...
      </div>
    );
  }

  const { available = [], impacted = [], available_count = 0, impacted_count = 0, total_services = 0 } = servicesStatus;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Live Campus Service Availability</h3>
        </div>
        <div className="flex space-x-2 text-xs font-medium">
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {available_count} Online
          </span>
          {impacted_count > 0 && (
            <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              {impacted_count} Impacted
            </span>
          )}
        </div>
      </div>

      {impacted_count > 0 && (
        <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-rose-200">Network Disruption Detected:</span> A link failure has isolated one or more critical service servers from the campus gateway. Apply a recovery route to restore service.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Available Services */}
        {available.map((srv) => (
          <div
            key={srv.id}
            className="p-3.5 bg-slate-950/50 border border-emerald-900/30 rounded-lg flex items-start justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-slate-100 text-sm">{srv.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{srv.description}</p>
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
              Active
            </span>
          </div>
        ))}

        {/* Impacted Services */}
        {impacted.map((srv) => (
          <div
            key={srv.id}
            className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-start justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span className="font-medium text-rose-200 text-sm">{srv.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{srv.description}</p>
              {srv.missing_nodes && srv.missing_nodes.length > 0 && (
                <div className="text-[11px] text-rose-400 mt-2 font-mono">
                  Unreachable nodes: {srv.missing_nodes.join(", ")}
                </div>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded">
              Down
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
