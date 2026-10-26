import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 text-center max-w-xl mx-auto my-12 space-y-4 border border-rose-500/30">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#E8D8C4]">
            Tab Visualizer Recovered
          </h3>
          <p className="text-xs text-[#C7B7A3]">
            {this.state.error?.message || "An unexpected rendering event occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-action-primary text-xs py-2 px-4 mx-auto inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
