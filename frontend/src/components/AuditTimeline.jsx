/**
 * Persistent MySQL Incident & Audit Timeline
 * Author: Preetika & Avanish Ayyappan
 */

import React, { useState } from "react";
import { History, ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default function AuditTimeline({ history = null, onRefresh }) {
  const [filter, setFilter] = useState("all");

  const failures = history?.failure_events || [];
  const recoveries = history?.recovery_events || [];

  return (
    <div className="space-y-4">
      <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            MySQL Persistent Incident Audit Trail
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Audited failure and recovery history persisted in MySQL for accountability.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`btn-action-outline text-xs ${filter === "all" ? "bg-slate-800 text-white" : ""}`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("failures")}
            className={`btn-action-outline text-xs ${filter === "failures" ? "bg-slate-800 text-rose-400" : ""}`}
          >
            Failures ({failures.length})
          </button>
          <button
            onClick={() => setFilter("recoveries")}
            className={`btn-action-outline text-xs ${filter === "recoveries" ? "bg-slate-800 text-emerald-400" : ""}`}
          >
            Recoveries ({recoveries.length})
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(filter === "all" || filter === "failures") &&
          failures.map((fe) => (
            <div
              key={`fe-${fe.event_id}`}
              className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-rose-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    Link Failure: <span className="font-mono text-cyan-400">{fe.link_id}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Severity: <strong className="text-rose-400">{fe.severity}</strong> | Status: {fe.status}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {fe.occurred_at || "Recent"}
              </div>
            </div>
          ))}

        {(filter === "all" || filter === "recoveries") &&
          recoveries.map((re) => (
            <div
              key={`re-${re.recovery_id}`}
              className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-emerald-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    Recovery Action: <span className="font-mono text-emerald-300">{re.link_id}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Type: {re.action_type} | Operational Cost: {re.cost_used} | Outcome: <strong className="text-emerald-400">{re.outcome}</strong>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {re.recovered_at || "Recent"}
              </div>
            </div>
          ))}

        {failures.length === 0 && recoveries.length === 0 && (
          <div className="glass-panel p-10 text-center text-slate-500 text-xs">
            No incidents recorded in the database yet. Trigger a link failure to view persistent MySQL records.
          </div>
        )}
      </div>
    </div>
  );
}
