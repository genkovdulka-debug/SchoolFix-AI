import { AlertCircle, CheckCircle2, Inbox, Info, Loader2, X } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="card empty-state" role="status">
      <Loader2 className="spin" size={28} />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="card empty-state">
      <Icon size={32} />
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card empty-state" role="alert">
      <AlertCircle size={32} className="icon-error" />
      <h2>Something went wrong</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--secondary" onClick={() => onRetry()}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Alert({ type = 'info', children, onClose }) {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <div className="alert__body">{children}</div>
      {onClose && (
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Dismiss message">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
