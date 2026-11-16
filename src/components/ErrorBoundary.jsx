import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-amber-200 shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Đã xảy ra sự cố nhỏ khi tải giao diện</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dữ liệu từ vựng của bạn vẫn an toàn. Hãy bấm nút bên dưới để khôi phục lại nhé!
            </p>
            {this.state.error && (
              <div className="mt-2 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200 text-left overflow-x-auto max-w-sm mx-auto font-mono">
                {String(this.state.error?.message || this.state.error)}
              </div>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Tải lại mục này
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
