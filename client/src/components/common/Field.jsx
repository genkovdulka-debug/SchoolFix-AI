export default function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <small className="field__hint">{hint}</small>}
      {error && (
        <small className="field__error" id={`${htmlFor}-error`} role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
