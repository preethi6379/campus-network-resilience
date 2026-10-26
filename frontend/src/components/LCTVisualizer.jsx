/**
 * Visual Dry-Run Algorithm Lab for Link-Cut Trees & Splay Rotations
 * Coffee Palette Theme: #561C24, #6D2932, #C7B7A3, #E8D8C4
 * Authors: Preetika & Avanish Ayyappan
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Scissors,
  Link2,
  GitBranch,
  Cpu,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";

// Standard viva dry-run scenarios for live exam demonstration
const PRESET_SCENARIOS = {
  splay: {
    id: "splay",
    title: "Splay Zig-Zag Rotation",
    subtitle: "Hoisting deep vertex x to root via double rotations",
    icon: RotateCw,
    steps: [
      {
        step: 1,
        operation: "SPLAY_INIT",
        target: "LMS Server (x)",
        complexity: "O(1) Check",
        explanation: "Target node x (LMS Server) is located deep in the auxiliary tree at depth 3, below parent p (Academic Core) and grandparent g (Gateway Tower). Current path queries take linear traversal.",
        treeType: "splay_step1",
        details: { "Target x": "LMS Server", "Parent p": "Academic Core", "Grandparent g": "Gateway Tower", "Case": "Zig-Zag (Opposite sides)" }
      },
      {
        step: 2,
        operation: "PUSH_DOWN",
        target: "Gateway Tower (g)",
        complexity: "O(1)",
        explanation: "Flushing lazy reversal tags from grandparent g down to x before structural rotations to maintain BST order.",
        treeType: "splay_step2",
        details: { "Tag Flushed": "reversed = false", "Tree Valid": "BST Invariant Confirmed" }
      },
      {
        step: 3,
        operation: "ROTATE_RIGHT (Zig)",
        target: "Academic Core (p)",
        complexity: "O(1) Pointers",
        explanation: "First rotation of the Zig-Zag pair: Rotating parent p around child x. Subtree B transitions to p's right child. Grandparent g remains parent of the pair.",
        treeType: "splay_step3",
        details: { "Rotation": "Right on Parent p", "Subtree Moved": "B re-attached to p" }
      },
      {
        step: 4,
        operation: "ROTATE_LEFT (Zag)",
        target: "LMS Server (x)",
        complexity: "O(1) Pointers",
        explanation: "Second rotation of the Zig-Zag pair: Rotating target node x around grandparent g. Node x is hoisted directly to the root of the auxiliary Splay tree!",
        treeType: "splay_step4",
        details: { "Rotation": "Left on Target x", "Grandparent g": "Now right child of x" }
      },
      {
        step: 5,
        operation: "SPLAY_COMPLETE",
        target: "LMS Server (x)",
        complexity: "Amortized O(log V)",
        explanation: "Splay complete! Node x is now the root of the auxiliary tree. Future access to x takes O(1) time. By Sleator & Tarjan's potential function, tree potential decreased by Delta Phi <= 3(r'(x) - r(x)).",
        treeType: "splay_step5",
        details: { "New Splay Root": "LMS Server (x)", "Tree Height": "Halved / Balanced", "Amortized Cost": "O(log V)" }
      }
    ]
  },
  cut: {
    id: "cut",
    title: "Cut(u, v) Cable Failure",
    subtitle: "Dynamic partitioning into 2 disjoint trees in O(log V)",
    icon: Scissors,
    steps: [
      {
        step: 1,
        operation: "ACCESS(u)",
        target: "Gateway Tower (u)",
        complexity: "O(log V)",
        explanation: "Accessing vertex u (Gateway Tower). Paves a preferred solid path from the root of the represented tree down to u by splaying along the path.",
        treeType: "cut_step1",
        details: { "Vertex u": "Gateway Tower", "Solid Path": "Root to u established" }
      },
      {
        step: 2,
        operation: "ACCESS(v) & SPLAY",
        target: "Academic Core (v)",
        complexity: "O(log V)",
        explanation: "Accessing vertex v (Academic Core) and splaying v to the root of the auxiliary tree. Because (u, v) is a tree edge, u is now the immediate left child of v in the auxiliary tree.",
        treeType: "cut_step2",
        details: { "Auxiliary Root": "Academic Core (v)", "Left Child": "Gateway Tower (u)", "Edge (u, v)": "Isolated at top" }
      },
      {
        step: 3,
        operation: "SEVER_LEFT_POINTER",
        target: "Cable (u, v)",
        complexity: "O(1)",
        explanation: "Severing pointers: v.left = null and u.parent = null. Both subtrees update their size and aggregate metrics via push_up().",
        treeType: "cut_step3",
        details: { "Action": "v.left = null", "Parent Pointer": "u.parent = null", "Status": "Edge severed" }
      },
      {
        step: 4,
        operation: "CUT_COMPLETE",
        target: "Disjoint Forests",
        complexity: "Amortized O(log V)",
        explanation: "Dynamic cut finished! The campus network is now split into two mathematically disjoint forests: Component A (Gateway, Cloud DC) and Component B (Academic Core, CSE, Library).",
        treeType: "cut_step4",
        details: { "Forest A": "Gateway, Cloud DC", "Forest B": "Academic, CSE, Library", "Partition": "Verified Disjoint" }
      }
    ]
  },
  link: {
    id: "link",
    title: "Link(u, v) Standby Activation",
    subtitle: "Dynamic unification of two trees in O(log V)",
    icon: Link2,
    steps: [
      {
        step: 1,
        operation: "FIND_ROOT(u) & (v)",
        target: "Verification",
        complexity: "O(log V)",
        explanation: "Executing find_root(u) and find_root(v) to verify that u and v reside in different connected components. Prevents inadvertent cycle creation in the dynamic forest.",
        treeType: "link_step1",
        details: { "Component 1 Root": "Gateway Tower", "Component 2 Root": "Academic Core", "Disjoint": "TRUE (Valid Link)" }
      },
      {
        step: 2,
        operation: "MAKE_ROOT(u)",
        target: "Cloud Data Center (u)",
        complexity: "O(log V)",
        explanation: "Calling make_root(u): Accesses u, splays u to the root of its auxiliary tree, and toggles u.reversed = true. Node u is now the shallowest root of its entire represented tree.",
        treeType: "link_step2",
        details: { "Node u": "Cloud Data Center", "Action": "u.reversed = true", "New Forest Root": "Cloud Data Center" }
      },
      {
        step: 3,
        operation: "ATTACH_POINTER",
        target: "Backup Fiber (u, v)",
        complexity: "O(1)",
        explanation: "Assigning path-parent pointer: u.parent = v (CSE Dept). The two disjoint trees are now unified into a single connected tree.",
        treeType: "link_step3",
        details: { "Pointer": "u.parent = v", "Standby Link": "LINK_RED_1 Activated", "Latency": "14 ms" }
      },
      {
        step: 4,
        operation: "LINK_COMPLETE",
        target: "Unified Campus Forest",
        complexity: "Amortized O(log V)",
        explanation: "Link completed! Total connectivity restored across all campus buildings in amortized O(log V) time, without rebuilding or re-traversing the full graph.",
        treeType: "link_step4",
        details: { "Status": "Connected", "Active Trees": "1 Unified Forest", "Service Impact": "0 Services Down" }
      }
    ]
  }
};

export default function LCTVisualizer({ trace = [] }) {
  const hasLiveTrace = Array.isArray(trace) && trace.length > 0;
  const [selectedScenario, setSelectedScenario] = useState(hasLiveTrace ? "live" : "splay");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // When live trace arrives, auto-select live mode
  useEffect(() => {
    if (hasLiveTrace) {
      setSelectedScenario("live");
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [trace]);

  // Determine active steps list
  const activeSteps = useMemo(() => {
    if (selectedScenario === "live" && hasLiveTrace) {
      return trace.map((t, idx) => ({
        step: idx + 1,
        operation: t.operation || "LCT_STEP",
        target: t.target || "Vertex",
        complexity: "Amortized O(log V)",
        explanation: t.explanation || "Executing Link-Cut Tree pointer update.",
        treeType: String(t.operation || "").toLowerCase().includes("cut") ? "cut_step3" : String(t.operation || "").toLowerCase().includes("link") ? "link_step3" : "splay_step4",
        details: (typeof t.details === "object" && t.details !== null) ? t.details : {}
      }));
    }
    const preset = PRESET_SCENARIOS[selectedScenario] || PRESET_SCENARIOS.splay;
    return preset.steps;
  }, [selectedScenario, trace, hasLiveTrace]);

  // Playback timer
  useEffect(() => {
    let timer = null;
    if (isPlaying && activeSteps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= activeSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, activeSteps.length]);

  const step = activeSteps[currentStepIndex] || activeSteps[0] || {
    step: 1,
    operation: "READY",
    target: "Campus Forest",
    complexity: "O(log V)",
    explanation: "Select a dry-run case above or fail a link to trace dynamic tree updates.",
    treeType: "splay_step1",
    details: {}
  };

  const detailsObj = (step && typeof step.details === "object" && step.details !== null) ? step.details : {};
  const detailsEntries = Object.entries(detailsObj);

  return (
    <div className="space-y-6">
      {/* 1. Dry-Run Case Selection Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#E8D8C4]" />
          <div>
            <h3 className="font-bold text-[#E8D8C4] text-sm">
              Link-Cut Tree Dry-Run Visual Lab
            </h3>
            <p className="text-[11px] text-[#C7B7A3]">
              Choose a viva dry-run scenario below or perform live mutations on the Campus Map.
            </p>
          </div>
        </div>

        {/* Scenario Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasLiveTrace && (
            <button
              onClick={() => {
                setSelectedScenario("live");
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedScenario === "live"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                  : "bg-[#1A0A0D] text-[#C7B7A3] hover:text-[#E8D8C4] border border-[rgba(199,183,163,0.3)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Live Campus Trace ({trace.length} ops)
            </button>
          )}

          <button
            onClick={() => {
              setSelectedScenario("splay");
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedScenario === "splay"
                ? "bg-[#561C24] text-[#E8D8C4] border border-[#E8D8C4] shadow-md"
                : "bg-[#1A0A0D] text-[#C7B7A3] hover:text-[#E8D8C4] border border-[rgba(199,183,163,0.3)]"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-300" />
            Splay Zig-Zag Dry Run
          </button>

          <button
            onClick={() => {
              setSelectedScenario("cut");
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedScenario === "cut"
                ? "bg-[#561C24] text-[#E8D8C4] border border-[#E8D8C4] shadow-md"
                : "bg-[#1A0A0D] text-[#C7B7A3] hover:text-[#E8D8C4] border border-[rgba(199,183,163,0.3)]"
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-rose-300" />
            Cut(u, v) Dry Run
          </button>

          <button
            onClick={() => {
              setSelectedScenario("link");
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedScenario === "link"
                ? "bg-[#561C24] text-[#E8D8C4] border border-[#E8D8C4] shadow-md"
                : "bg-[#1A0A0D] text-[#C7B7A3] hover:text-[#E8D8C4] border border-[rgba(199,183,163,0.3)]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-300" />
            Link(u, v) Dry Run
          </button>
        </div>
      </div>

      {/* 2. Visual Dry-Run Diagram Canvas & Step Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Canvas: SVG Visual Dry-Run Diagram */}
        <div className="lg:col-span-7 glass-panel-glow p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[rgba(199,183,163,0.2)] pb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#C7B7A3]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#E8D8C4]">
                Dry-Run Splay & Pointer Diagram
              </span>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#1A0A0D] border border-emerald-500/40 text-emerald-300">
              {step.complexity || "Amortized O(log V)"}
            </span>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="bg-[#16070A] rounded-2xl p-4 border border-[rgba(199,183,163,0.2)] min-h-[320px] flex items-center justify-center relative overflow-hidden shadow-inner">
            <DryRunSvgCanvas stepType={step.treeType} stepData={step} />
          </div>

          {/* Stepper Controls Bar */}
          <div className="flex items-center justify-between bg-[#1A0A0D] p-3 rounded-xl border border-[rgba(199,183,163,0.25)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentStepIndex === 0}
                className="btn-action-outline p-1.5"
                title="Previous Dry-Run Step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-action-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? "Pause" : "Play Dry-Run"}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.min(activeSteps.length - 1, prev + 1));
                }}
                disabled={currentStepIndex === activeSteps.length - 1}
                className="btn-action-outline p-1.5"
                title="Next Dry-Run Step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-mono text-[#E8D8C4] font-bold">
              Step <span className="text-cyan-300">#{currentStepIndex + 1}</span> of {activeSteps.length}
            </div>
          </div>
        </div>

        {/* Right Details: Algorithmic Explanation & Viva Card */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(199,183,163,0.2)] pb-3">
              <span className="text-xs uppercase font-mono font-bold px-2.5 py-1 rounded bg-[#561C24] text-[#E8D8C4] border border-[#C7B7A3]/50">
                {String(step.operation || "").replace(/_/g, " ")}
              </span>
              <span className="text-xs text-[#C7B7A3] font-mono">
                Target: <strong className="text-white">{step.target || "N/A"}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#C7B7A3] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#E8D8C4]" /> Dry-Run Algorithm Execution:
              </div>
              <p className="text-xs text-[#E8D8C4] leading-relaxed bg-[#1A0A0D] p-3.5 rounded-xl border border-[rgba(199,183,163,0.2)]">
                {step.explanation}
              </p>
            </div>

            {detailsEntries.length > 0 && (
              <div className="p-3 bg-[#1A0A0D]/80 rounded-xl border border-[rgba(199,183,163,0.2)] text-xs font-mono space-y-1.5 text-[#C7B7A3]">
                <div className="text-[11px] font-bold text-[#E8D8C4] border-b border-[rgba(199,183,163,0.2)] pb-1">
                  Dynamic Forest Pointer State:
                </div>
                {detailsEntries.map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-[#E8D8C4] font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Viva Reference Card */}
          <div className="p-3.5 rounded-xl bg-[#280E14] border border-[#C7B7A3]/40 space-y-2 text-[11px] text-[#C7B7A3]">
            <div className="font-bold text-[#E8D8C4] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Viva Splay Case Guide:
            </div>
            <div className="leading-snug">
              • <strong>Zig:</strong> Parent p is root ➔ 1 single rotation of x.
            </div>
            <div className="leading-snug">
              • <strong>Zig-Zig:</strong> x and p are both left or right children ➔ Rotate p then x.
            </div>
            <div className="leading-snug">
              • <strong>Zig-Zag:</strong> x and p are on opposite sides ➔ Rotate x twice!
            </div>
            <div className="leading-snug text-emerald-300 font-mono pt-1 border-t border-[rgba(199,183,163,0.2)]">
              Potential: &Delta;&Phi; = &Phi;(T') - &Phi;(T) &le; 3(r'(x) - r(x)) = O(log V)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Execution Dry-Run Trace Table */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[rgba(199,183,163,0.2)] pb-2">
          <h4 className="font-bold text-[#E8D8C4] text-sm">
            Dry-Run Operation Trace Table (Viva Algorithm Record)
          </h4>
          <span className="text-xs text-[#C7B7A3]">
            {activeSteps.length} Steps in Scenario
          </span>
        </div>

        <div className="overflow-x-auto max-h-[240px]">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[rgba(199,183,163,0.2)] text-[#C7B7A3] bg-[#1A0A0D]">
                <th className="p-2.5">Step</th>
                <th className="p-2.5">Primitive Operation</th>
                <th className="p-2.5">Target Vertex</th>
                <th className="p-2.5">Action Walkthrough</th>
                <th className="p-2.5">Amortized Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(199,183,163,0.1)]">
              {activeSteps.map((t, idx) => (
                <tr
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`cursor-pointer transition ${
                    idx === currentStepIndex
                      ? "bg-[#561C24] text-white font-bold"
                      : "text-[#E8D8C4] hover:bg-[#280E14]"
                  }`}
                >
                  <td className="p-2.5 text-center">#{t.step}</td>
                  <td className="p-2.5 text-cyan-300">{t.operation}</td>
                  <td className="p-2.5 text-[#C7B7A3]">{t.target}</td>
                  <td className="p-2.5 max-w-[320px] truncate font-sans text-xs">{t.explanation}</td>
                  <td className="p-2.5 text-emerald-400">{t.complexity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual SVG Dry-Run Tree Renderer
 * Dynamically switches between crisp vector diagrams matching the active dry-run step
 */
function DryRunSvgCanvas({ stepType, stepData }) {
  // SPLAY ROTATION STEPS
  if (stepType === "splay_step1" || stepType === "splay_step2") {
    // Step 1 & 2: Deep skewed chain (g -> p -> x)
    return (
      <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
        {/* Grandparent g */}
        <g transform="translate(140, 45)">
          <circle cx="0" cy="0" r="24" fill="#561C24" stroke="#E8D8C4" strokeWidth="2.5" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="12" fontWeight="bold" textAnchor="middle">g (GW)</text>
          <text x="0" y="-30" fill="#C7B7A3" fontSize="10" textAnchor="middle">Grandparent</text>
        </g>

        {/* Edge g -> p */}
        <line x1="140" y1="69" x2="220" y2="120" stroke="#C7B7A3" strokeWidth="2.5" />

        {/* Parent p */}
        <g transform="translate(220, 120)">
          <circle cx="0" cy="0" r="22" fill="#6D2932" stroke="#E8D8C4" strokeWidth="2" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="11" fontWeight="bold" textAnchor="middle">p (Acad)</text>
          <text x="35" y="4" fill="#C7B7A3" fontSize="10">Parent</text>
        </g>

        {/* Edge p -> x */}
        <line x1="220" y1="142" x2="160" y2="195" stroke="#00FF88" strokeWidth="3" strokeDasharray="5,3" />

        {/* Target x */}
        <g transform="translate(160, 195)">
          <circle cx="0" cy="0" r="24" fill="#881337" stroke="#00FF88" strokeWidth="3" />
          <text x="0" y="5" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">x (LMS)</text>
          <text x="0" y="38" fill="#00FF88" fontSize="11" fontWeight="bold" textAnchor="middle">Target x (Depth 3)</text>
        </g>

        {/* Status Callout */}
        <rect x="250" y="175" width="190" height="45" rx="8" fill="#2E0F14" stroke="#C7B7A3" strokeWidth="1" />
        <text x="345" y="195" fill="#E8D8C4" fontSize="10" fontWeight="bold" textAnchor="middle">
          {stepType === "splay_step1" ? "Zig-Zag Case Detected" : "Flushing Lazy Tags"}
        </text>
        <text x="345" y="210" fill="#00FF88" fontSize="9" textAnchor="middle">
          {stepType === "splay_step1" ? "Opposite children alignment" : "Pushing lazy reversed down"}
        </text>
      </svg>
    );
  }

  if (stepType === "splay_step3") {
    // Step 3: After Zig (Rotate parent p around x)
    return (
      <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
        {/* Grandparent g */}
        <g transform="translate(160, 45)">
          <circle cx="0" cy="0" r="24" fill="#561C24" stroke="#E8D8C4" strokeWidth="2.5" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="12" fontWeight="bold" textAnchor="middle">g (GW)</text>
        </g>

        {/* Edge g -> x */}
        <line x1="160" y1="69" x2="240" y2="115" stroke="#00FF88" strokeWidth="3" />

        {/* Target x (hoisted to parent position) */}
        <g transform="translate(240, 115)">
          <circle cx="0" cy="0" r="24" fill="#881337" stroke="#00FF88" strokeWidth="3" />
          <text x="0" y="5" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">x (LMS)</text>
          <text x="40" y="4" fill="#00FF88" fontSize="10" fontWeight="bold">Rotated 1 (Zig)</text>
        </g>

        {/* Edge x -> p */}
        <line x1="240" y1="139" x2="300" y2="190" stroke="#C7B7A3" strokeWidth="2" />

        {/* Parent p (now child of x) */}
        <g transform="translate(300, 190)">
          <circle cx="0" cy="0" r="20" fill="#6D2932" stroke="#E8D8C4" strokeWidth="1.5" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="10" textAnchor="middle">p (Acad)</text>
        </g>

        {/* Rotation Indicator */}
        <rect x="40" y="170" width="180" height="45" rx="8" fill="#2E0F14" stroke="#00FF88" strokeWidth="1" />
        <text x="130" y="190" fill="#E8D8C4" fontSize="10" fontWeight="bold" textAnchor="middle">
          Zig Completed (1/2)
        </text>
        <text x="130" y="205" fill="#00FF88" fontSize="9" textAnchor="middle">
          Now rotate x around g (Zag)
        </text>
      </svg>
    );
  }

  if (stepType === "splay_step4" || stepType === "splay_step5") {
    // Step 4 & 5: After Zag - x is ROOT!
    return (
      <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
        {/* Node x is now ROOT */}
        <g transform="translate(230, 45)">
          <circle cx="0" cy="0" r="28" fill="#881337" stroke="#00FF88" strokeWidth="3.5" />
          <text x="0" y="5" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">x (LMS)</text>
          <text x="0" y="-35" fill="#00FF88" fontSize="12" fontWeight="bold" textAnchor="middle">👑 NEW SPLAY ROOT</text>
        </g>

        {/* Left branch to g */}
        <line x1="210" y1="65" x2="130" y2="130" stroke="#00FF88" strokeWidth="2.5" />
        <g transform="translate(130, 130)">
          <circle cx="0" cy="0" r="22" fill="#561C24" stroke="#E8D8C4" strokeWidth="2" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="11" fontWeight="bold" textAnchor="middle">g (GW)</text>
          <text x="0" y="36" fill="#C7B7A3" fontSize="10" textAnchor="middle">Left Child</text>
        </g>

        {/* Right branch to p */}
        <line x1="250" y1="65" x2="330" y2="130" stroke="#00FF88" strokeWidth="2.5" />
        <g transform="translate(330, 130)">
          <circle cx="0" cy="0" r="22" fill="#6D2932" stroke="#E8D8C4" strokeWidth="2" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="11" fontWeight="bold" textAnchor="middle">p (Acad)</text>
          <text x="0" y="36" fill="#C7B7A3" fontSize="10" textAnchor="middle">Right Child</text>
        </g>

        {/* Bottom Banner */}
        <rect x="70" y="190" width="320" height="36" rx="8" fill="#1B4332" stroke="#00FF88" strokeWidth="1.5" />
        <text x="230" y="212" fill="#D8F3DC" fontSize="11" fontWeight="bold" textAnchor="middle">
          Balanced: Height Reduced in Amortized O(log V)
        </text>
      </svg>
    );
  }

  // CUT OPERATION STEPS
  if (stepType === "cut_step1" || stepType === "cut_step2") {
    return (
      <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
        {/* Vertex v on top */}
        <g transform="translate(230, 50)">
          <circle cx="0" cy="0" r="24" fill="#561C24" stroke="#E8D8C4" strokeWidth="2.5" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="11" fontWeight="bold" textAnchor="middle">v (Acad)</text>
          <text x="0" y="-30" fill="#C7B7A3" fontSize="10" textAnchor="middle">Auxiliary Root</text>
        </g>

        {/* Scissor on target edge */}
        <line x1="210" y1="68" x2="130" y2="140" stroke="#FF4D6D" strokeWidth="3" strokeDasharray="6,4" />
        <circle cx="170" cy="104" r="14" fill="#9F1239" stroke="#FF4D6D" strokeWidth="1.5" />
        <text x="170" y="108" fill="#FFF" fontSize="12" textAnchor="middle">✂️</text>

        {/* Vertex u */}
        <g transform="translate(130, 140)">
          <circle cx="0" cy="0" r="24" fill="#6D2932" stroke="#FF4D6D" strokeWidth="2.5" />
          <text x="0" y="5" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">u (GW)</text>
          <text x="0" y="38" fill="#FFA3B0" fontSize="10" textAnchor="middle">Sever Target</text>
        </g>

        {/* Other vertices */}
        <line x1="250" y1="68" x2="330" y2="140" stroke="#C7B7A3" strokeWidth="2" />
        <g transform="translate(330, 140)">
          <circle cx="0" cy="0" r="20" fill="#280E14" stroke="#C7B7A3" strokeWidth="1.5" />
          <text x="0" y="5" fill="#C7B7A3" fontSize="10" textAnchor="middle">Subtree</text>
        </g>

        <rect x="70" y="195" width="320" height="35" rx="8" fill="#2E0F14" stroke="#FF4D6D" strokeWidth="1" />
        <text x="230" y="217" fill="#FFCCD5" fontSize="11" fontWeight="bold" textAnchor="middle">
          Isolating Edge (u, v) at Root of Auxiliary Tree
        </text>
      </svg>
    );
  }

  if (stepType === "cut_step3" || stepType === "cut_step4") {
    // Cut complete: Disjoint components
    return (
      <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
        {/* Component A */}
        <g transform="translate(120, 60)">
          <rect x="-70" y="-30" width="140" height="110" rx="14" fill="#2E0F14" stroke="#FF4D6D" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x="0" y="-14" fill="#FFA3B0" fontSize="10" fontWeight="bold" textAnchor="middle">COMPONENT A</text>
          <circle cx="-25" cy="20" r="18" fill="#561C24" stroke="#E8D8C4" strokeWidth="2" />
          <text x="-25" y="24" fill="#E8D8C4" fontSize="10" fontWeight="bold" textAnchor="middle">u (GW)</text>
          <circle cx="25" cy="50" r="16" fill="#6D2932" stroke="#E8D8C4" strokeWidth="1.5" />
          <text x="25" y="54" fill="#E8D8C4" fontSize="9" textAnchor="middle">Cloud</text>
          <line x1="-12" y1="30" x2="12" y2="45" stroke="#C7B7A3" strokeWidth="1.5" />
        </g>

        {/* Cut Gap Icon */}
        <g transform="translate(230, 85)">
          <circle cx="0" cy="0" r="20" fill="#9F1239" stroke="#FF4D6D" strokeWidth="2" />
          <text x="0" y="5" fill="#FFF" fontSize="15" textAnchor="middle">✂️</text>
          <text x="0" y="32" fill="#FFA3B0" fontSize="11" fontWeight="bold" textAnchor="middle">SEVERED</text>
        </g>

        {/* Component B */}
        <g transform="translate(340, 60)">
          <rect x="-70" y="-30" width="140" height="110" rx="14" fill="#2E0F14" stroke="#FF4D6D" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x="0" y="-14" fill="#FFA3B0" fontSize="10" fontWeight="bold" textAnchor="middle">COMPONENT B</text>
          <circle cx="-25" cy="20" r="18" fill="#561C24" stroke="#E8D8C4" strokeWidth="2" />
          <text x="-25" y="24" fill="#E8D8C4" fontSize="10" fontWeight="bold" textAnchor="middle">v (Acad)</text>
          <circle cx="25" cy="50" r="16" fill="#6D2932" stroke="#E8D8C4" strokeWidth="1.5" />
          <text x="25" y="54" fill="#E8D8C4" fontSize="9" textAnchor="middle">CSE</text>
          <line x1="-12" y1="30" x2="12" y2="45" stroke="#C7B7A3" strokeWidth="1.5" />
        </g>

        <rect x="70" y="195" width="320" height="35" rx="8" fill="#2E0F14" stroke="#FF4D6D" strokeWidth="1" />
        <text x="230" y="217" fill="#FFCCD5" fontSize="11" fontWeight="bold" textAnchor="middle">
          Disjoint Auxiliary Splay Forests Formed in O(log V)
        </text>
      </svg>
    );
  }

  // LINK OPERATION STEPS
  if (stepType === "link_step1" || stepType === "link_step2") {
    return (
      <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
        {/* Tree 1 */}
        <g transform="translate(110, 75)">
          <circle cx="0" cy="0" r="24" fill="#561C24" stroke="#00FF88" strokeWidth="2.5" />
          <text x="0" y="5" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">u (Cloud)</text>
          <text x="0" y="-32" fill="#00FF88" fontSize="10" fontWeight="bold" textAnchor="middle">make_root(u)</text>
          <line x1="-15" y1="20" x2="-35" y2="55" stroke="#C7B7A3" strokeWidth="2" />
          <circle cx="-35" cy="55" r="16" fill="#6D2932" stroke="#E8D8C4" strokeWidth="1.5" />
          <text x="-35" y="59" fill="#E8D8C4" fontSize="9" textAnchor="middle">GW</text>
        </g>

        {/* Standby Candidate Arrow */}
        <g transform="translate(230, 75)">
          <line x1="-70" y1="0" x2="70" y2="0" stroke="#00FF88" strokeWidth="2.5" strokeDasharray="6,4" />
          <polygon points="70,0 58,-6 58,6" fill="#00FF88" />
          <circle cx="0" cy="0" r="16" fill="#064E3B" stroke="#00FF88" strokeWidth="1.5" />
          <text x="0" y="4" fill="#00FF88" fontSize="12" textAnchor="middle">🔗</text>
          <text x="0" y="26" fill="#00FF88" fontSize="10" fontWeight="bold" textAnchor="middle">STANDBY</text>
        </g>

        {/* Tree 2 */}
        <g transform="translate(350, 75)">
          <circle cx="0" cy="0" r="24" fill="#561C24" stroke="#E8D8C4" strokeWidth="2" />
          <text x="0" y="5" fill="#E8D8C4" fontSize="11" fontWeight="bold" textAnchor="middle">v (CSE)</text>
          <text x="0" y="-32" fill="#C7B7A3" fontSize="10" textAnchor="middle">Target Parent</text>
          <line x1="15" y1="20" x2="35" y2="55" stroke="#C7B7A3" strokeWidth="2" />
          <circle cx="35" cy="55" r="16" fill="#6D2932" stroke="#E8D8C4" strokeWidth="1.5" />
          <text x="35" y="59" fill="#E8D8C4" fontSize="9" textAnchor="middle">Acad</text>
        </g>

        <rect x="70" y="195" width="320" height="35" rx="8" fill="#1B4332" stroke="#00FF88" strokeWidth="1" />
        <text x="230" y="217" fill="#D8F3DC" fontSize="11" fontWeight="bold" textAnchor="middle">
          Node u Rerooted: Ready for Pointer Link u.parent = v
        </text>
      </svg>
    );
  }

  // link_step3 or link_step4: Trees unified
  return (
    <svg viewBox="0 0 460 250" className="w-full h-auto max-w-[440px]">
      {/* Root v */}
      <g transform="translate(230, 45)">
        <circle cx="0" cy="0" r="26" fill="#561C24" stroke="#00FF88" strokeWidth="3" />
        <text x="0" y="5" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">v (CSE)</text>
        <text x="0" y="-32" fill="#00FF88" fontSize="11" fontWeight="bold" textAnchor="middle">UNIFIED ROOT</text>
      </g>

      {/* Solid Recovered Link to u */}
      <line x1="210" y1="65" x2="130" y2="135" stroke="#00FF88" strokeWidth="3.5" />
      <g transform="translate(130, 135)">
        <circle cx="0" cy="0" r="22" fill="#064E3B" stroke="#00FF88" strokeWidth="2.5" />
        <text x="0" y="5" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">u (Cloud)</text>
        <text x="0" y="36" fill="#00FF88" fontSize="10" fontWeight="bold" textAnchor="middle">u.parent = v</text>
      </g>

      {/* Right branch */}
      <line x1="250" y1="65" x2="330" y2="135" stroke="#C7B7A3" strokeWidth="2" />
      <g transform="translate(330, 135)">
        <circle cx="0" cy="0" r="22" fill="#6D2932" stroke="#E8D8C4" strokeWidth="2" />
        <text x="0" y="5" fill="#E8D8C4" fontSize="11" fontWeight="bold" textAnchor="middle">Acad Core</text>
      </g>

      <rect x="70" y="195" width="320" height="35" rx="8" fill="#1B4332" stroke="#00FF88" strokeWidth="1.5" />
      <text x="230" y="217" fill="#D8F3DC" fontSize="11" fontWeight="bold" textAnchor="middle">
        Unified Campus Dynamic Forest: 100% Connectivity Restored
      </text>
    </svg>
  );
}
