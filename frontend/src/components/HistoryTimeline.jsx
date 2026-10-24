/**
 * Event History & MySQL Audit Timeline
 * Author: Preetika (Frontend Lead)
 */

import React, { useState } from "react";
import { History, ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default function HistoryTimeline({ history = null, onRefresh }) {
  const [activeTab, setActiveTab] = useState("all");

  if (!history) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-sm text-center">
        Loading event history from MySQL...
      </div>
    );
  }

  const { failure_events = [], recovery_events = [], operations = [] } = history;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">MySQL Audit History & Timeline</h3>
        </div>
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded transition ${activeTab === "all" ? "bg-slate-800 text-cyan-400 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab("failures")}
            className={`px-2.5 py-1 rounded transition ${activeTab === "failures" ? "bg-slate-800 text-rose-400 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
          >
            Failures ({failure_events.length})
          </button>
          <button
            onClick={() => setActiveTab("recoveries")}
            className={`px-2.5 py-1 rounded transition ${activeTab === "recoveries" ? "bg-slate-800 text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
          >
            Recoveries ({recovery_events.length})
          </button>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
        {/* Failures */}
        {(activeTab === "all" || activeTab === "failures") &&
          failure_events.map((fe) => (
            <div
              key={`fe-${fe.event_id}`}
              className="p-3 bg-slate-950/70 border border-rose-950/40 rounded-lg flex items-start justify-between text-xs"
            >
              <div className="flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-300">
                    Failure Event #{fe.event_id}: Severed Link <span className="font-mono text-slate-200">{fe.link_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Severity: <span className="font-semibold text-rose-400">{fe.severity}</span> | Notes: {fe.notes || "None"}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {fe.occurred_at || "Recent"}
              </div>
            </div>
          ))}

        {/* Recoveries */}
        {(activeTab === "all" || activeTab === "recoveries") &&
          recovery_events.map((re) => (
            <div
              key={`re-${re.recovery_id}`}
              className="p-3 bg-slate-950/70 border border-emerald-950/40 rounded-lg flex items-start justify-between text-xs"
            >
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-300">
                    Recovery #{re.recovery_id}: Activated <span className="font-mono text-slate-200">{re.link_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Action: {re.action_type} | Cost Incurred: {re.cost_used} | Outcome: <span className="text-emerald-400 font-semibold">{re.outcome}</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {re.recovered_at || "Recent"}
              </div>
            </div>
          ))}

        {failure_events.length === 0 && recovery_events.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-6">
            No events recorded yet. Trigger link failures to view persistent MySQL records.
          </div>
        )}
      </div>
    </div>
  );
}
