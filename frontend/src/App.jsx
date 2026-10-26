/**
 * Campus Network Resilience Visualizer - Main Controller
 * "Coffee" Executive Palette Theme: #561C24, #6D2932, #C7B7A3, #E8D8C4
 * Authors: Preetika (Frontend) & Avanish Ayyappan (Backend)
 */

import React, { useState, useEffect } from "react";
import {
  Map,
  Activity,
  Cpu,
  Radio,
  History,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import NetworkMap from "./components/NetworkMap";
import SimulationCenter from "./components/SimulationCenter";
import LCTVisualizer from "./components/LCTVisualizer";
import PathRadar from "./components/PathRadar";
import AuditTimeline from "./components/AuditTimeline";

import {
  checkHealth,
  fetchNetwork,
  failLink,
  restoreLink,
  fetchRecoveryPlan,
  applyRecovery,
  fetchHistory,
  undoOperation,
  redoOperation,
  checkConnectivity
} from "./api/client";

import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [servicesStatus, setServicesStatus] = useState(null);
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [recoveryCandidates, setRecoveryCandidates] = useState([]);
  const [lctTrace, setLctTrace] = useState([]);
  const [history, setHistory] = useState(null);
  const [connectivityResult, setConnectivityResult] = useState(null);
  const [backendHealth, setBackendHealth] = useState("CHECKING");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const health = await checkHealth();
      setBackendHealth(health.status || "OFFLINE");

      const netData = await fetchNetwork();
      setNodes(netData.nodes || []);
      setLinks(netData.links || []);
      setBuildings(netData.buildings || []);
      setServicesStatus(netData.services_status || null);

      const histData = await fetchHistory(30);
      setHistory(histData);
    } catch (err) {
      showNotification("Could not reach backend API on port 5000.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFailLink = async (linkId, severity = "HIGH") => {
    if (!linkId) return;
    setLoading(true);
    try {
      const res = await failLink(linkId, severity);
      setLinks(res.network.links);
      setServicesStatus({
        ...servicesStatus,
        available: res.available_services,
        impacted: res.impacted_services,
        available_count: res.available_services.length,
        impacted_count: res.impacted_services.length
      });
      setLctTrace(res.lct_trace || []);
      showNotification(`Fiber ${linkId} severed. LCT dynamic cut executed in O(log V).`, "warning");

      const plan = await fetchRecoveryPlan();
      setRecoveryCandidates(plan.candidates || []);

      const hist = await fetchHistory(30);
      setHistory(hist);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreLink = async (linkId) => {
    if (!linkId) return;
    setLoading(true);
    try {
      const res = await restoreLink(linkId);
      setLinks(res.network.links);
      setServicesStatus({
        ...servicesStatus,
        impacted: res.impacted_services,
        available_count: res.network.nodes.length,
        impacted_count: res.impacted_services.length
      });
      setLctTrace(res.lct_trace || []);
      setRecoveryCandidates([]);
      showNotification(`Fiber ${linkId} restored to active dynamic backbone.`, "success");

      const hist = await fetchHistory(30);
      setHistory(hist);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecovery = async (candidateLinkId) => {
    setLoading(true);
    try {
      const res = await applyRecovery(candidateLinkId);
      setLinks(res.network.links);
      setServicesStatus({
        ...servicesStatus,
        available: res.available_services,
        impacted: res.impacted_services,
        available_count: res.available_services.length,
        impacted_count: res.impacted_services.length
      });
      setLctTrace(res.lct_trace || []);
      setRecoveryCandidates([]);
      showNotification(`Backup route ${candidateLinkId} deployed! Partition resolved in O(log V).`, "success");

      const hist = await fetchHistory(30);
      setHistory(hist);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      const res = await undoOperation();
      if (res.result === "UNDONE") {
        setLinks(res.network.links);
        setLctTrace(res.lct_trace || []);
        showNotification(`Undid mutation: ${res.undone_action}`, "info");
        const hist = await fetchHistory(30);
        setHistory(hist);
        const net = await fetchNetwork();
        setServicesStatus(net.services_status);
      }
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRedo = async () => {
    setLoading(true);
    try {
      const res = await redoOperation();
      if (res.result === "REDONE") {
        setLinks(res.network.links);
        setLctTrace(res.lct_trace || []);
        showNotification(`Redid mutation: ${res.redone_action}`, "info");
        const hist = await fetchHistory(30);
        setHistory(hist);
        const net = await fetchNetwork();
        setServicesStatus(net.services_status);
      }
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConnectivity = async (src, dst) => {
    try {
      const res = await checkConnectivity(src, dst);
      setConnectivityResult(res);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#150608] text-[#e8d8c4] flex flex-col">
      {/* Top Header - Coffee Executive Theme */}
      <header className="border-b border-[rgba(199,183,163,0.2)] bg-[#220b0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#561c24] to-[#6d2932] border border-[#c7b7a3]/40 flex items-center justify-center shadow-lg shadow-[#561c24]/50">
              <Zap className="w-5 h-5 text-[#e8d8c4]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#e8d8c4] tracking-tight m-0">
                Campus Network Resilience Visualizer
              </h1>
              <div className="text-xs text-[#c7b7a3]">
                Link-Cut Tree Dynamic Forest Operations in <span className="text-white font-mono font-bold">O(log V)</span> Time
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block text-xs">
              <div className="text-[#e8d8c4] font-semibold">Preetika & Avanish Ayyappan</div>
              <div className="text-[#c7b7a3] text-[11px]">Amrita Campus Network Resilience Project</div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${backendHealth === 'HEALTHY' ? 'bg-[#561c24] text-[#e8d8c4] border border-[#c7b7a3]/40' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                <span className={`w-2 h-2 rounded-full ${backendHealth === 'HEALTHY' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                API: {backendHealth}
              </span>

              <button
                onClick={loadData}
                disabled={loading}
                title="Reload Topology"
                className="btn-action-outline p-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#e8d8c4]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 py-1.5 border-t border-[rgba(199,183,163,0.15)] flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("map")}
            className={`nav-tab-btn ${activeTab === "map" ? "active" : ""}`}
          >
            <Map className="w-4 h-4" /> 1. Campus Map & Signals
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`nav-tab-btn ${activeTab === "simulation" ? "active" : ""}`}
          >
            <Activity className="w-4 h-4" /> 2. Resilience Simulator
          </button>
          <button
            onClick={() => setActiveTab("lct")}
            className={`nav-tab-btn ${activeTab === "lct" ? "active" : ""}`}
          >
            <Cpu className="w-4 h-4" /> 3. Dynamic LCT Stepper {lctTrace.length > 0 && `(${lctTrace.length} ops)`}
          </button>
          <button
            onClick={() => setActiveTab("radar")}
            className={`nav-tab-btn ${activeTab === "radar" ? "active" : ""}`}
          >
            <Radio className="w-4 h-4" /> 4. Path Latency Radar
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`nav-tab-btn ${activeTab === "history" ? "active" : ""}`}
          >
            <History className="w-4 h-4" /> 5. Incident Audit Log
          </button>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 ${notification.type === 'error' ? 'bg-[#561c24] border-rose-600 text-rose-200' : notification.type === 'warning' ? 'bg-[#6d2932] border-[#c7b7a3] text-[#e8d8c4]' : 'bg-[#2e0f14] border-[#c7b7a3] text-[#e8d8c4]'}`}>
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {notification.msg}
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {activeTab === "map" && (
          <NetworkMap
            nodes={nodes}
            links={links}
            selectedLinkId={selectedLinkId}
            onSelectLink={(id) => setSelectedLinkId(id)}
            onFailLink={handleFailLink}
            onRestoreLink={handleRestoreLink}
            onApplyRecovery={handleApplyRecovery}
            recoveryCandidates={recoveryCandidates}
            loading={loading}
          />
        )}

        {activeTab === "simulation" && (
          <SimulationCenter
            links={links}
            servicesStatus={servicesStatus}
            recoveryCandidates={recoveryCandidates}
            onFailLink={handleFailLink}
            onRestoreLink={handleRestoreLink}
            onRequestRecovery={() => fetchRecoveryPlan().then((p) => setRecoveryCandidates(p.candidates || []))}
            onApplyRecovery={handleApplyRecovery}
            onUndo={handleUndo}
            onRedo={handleRedo}
            loading={loading}
          />
        )}

        {activeTab === "lct" && (
          <LCTVisualizer trace={lctTrace} />
        )}

        {activeTab === "radar" && (
          <PathRadar
            nodes={nodes}
            onCheckConnectivity={handleCheckConnectivity}
            connectivityResult={connectivityResult}
            loading={loading}
          />
        )}

        {activeTab === "history" && (
          <AuditTimeline history={history} onRefresh={loadData} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(199,183,163,0.15)] bg-[#150608] py-4 text-center text-xs text-[#c7b7a3]">
        Campus Network Resilience Visualizer • Splay-Tree LCT Dynamic Forest Operations in Amortized O(log V)
      </footer>
    </div>
  );
}
