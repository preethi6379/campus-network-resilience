/**
 * Campus Network Resilience - API Client
 * Author: Preetika (Frontend Lead)
 *
 * Connects React UI to Flask REST API endpoints with configurable base URL.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { status: "OFFLINE", error: err.message };
  }
}

export async function fetchNetwork() {
  const res = await fetch(`${API_BASE}/network`);
  if (!res.ok) throw new Error(`Failed to fetch network topology: ${res.statusText}`);
  return await res.json();
}

export async function failLink(linkId, severity = "HIGH", notes = "Simulated via UI") {
  const res = await fetch(`${API_BASE}/links/${encodeURIComponent(linkId)}/fail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ severity, notes })
  });
  if (!res.ok) throw new Error(`Failed to simulate link failure: ${res.statusText}`);
  return await res.json();
}

export async function restoreLink(linkId) {
  const res = await fetch(`${API_BASE}/links/${encodeURIComponent(linkId)}/restore`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Failed to restore link: ${res.statusText}`);
  return await res.json();
}

export async function fetchRecoveryPlan() {
  const res = await fetch(`${API_BASE}/recovery/plan`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Failed to retrieve recovery plan: ${res.statusText}`);
  return await res.json();
}

export async function applyRecovery(linkId) {
  const res = await fetch(`${API_BASE}/recovery/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link_id: linkId })
  });
  if (!res.ok) throw new Error(`Failed to apply recovery link: ${res.statusText}`);
  return await res.json();
}

export async function fetchHistory(limit = 30) {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.statusText}`);
  return await res.json();
}

export async function undoOperation() {
  const res = await fetch(`${API_BASE}/operations/undo`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to undo: ${res.statusText}`);
  return await res.json();
}

export async function redoOperation() {
  const res = await fetch(`${API_BASE}/operations/redo`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to redo: ${res.statusText}`);
  return await res.json();
}

export async function checkConnectivity(source, target) {
  const res = await fetch(`${API_BASE}/connectivity?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`);
  if (!res.ok) throw new Error(`Failed to query connectivity: ${res.statusText}`);
  return await res.json();
}

export async function fetchLctTrace(operationId) {
  const res = await fetch(`${API_BASE}/lct/trace/${operationId}`);
  if (!res.ok) throw new Error(`Failed to fetch LCT trace: ${res.statusText}`);
  return await res.json();
}
