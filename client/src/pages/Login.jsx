import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { DEMO_PASSWORD, ROLE_LIST } from '../data/roles.js';
import { useRole } from '../context/RoleContext.jsx';
import Field from '../components/common/Field.jsx';
import { Alert } from '../components/common/States.jsx';
import { createAccount, login as apiLogin } from '../services/api.js';

export default function Login() {
  const { loggedIn, login } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (loggedIn && !busy) return <Navigate to="/dashboard" replace />;

  const finish = (roleId, user) => {
    setBusy(true);
    setMessage({ type: 'success', text: `Welcome, ${user.name || user.email}. Signing you in...` });
    timer.current = setTimeout(() => {
      login(roleId);
      navigate('/dashboard');
    }, 700);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    setMessage(null);
    if (Object.keys(next).length) return;

    try {
      setBusy(true);
      const result = await apiLogin(email.trim(), password);
      const { user, roleId } = result;
      finish(roleId || user.role, user);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Incorrect email or password.' });
      setBusy(false);
    }
  };

  const onCreateAccount = async (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = 'Enter your full name.';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter a password.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    setMessage(null);
    if (Object.keys(next).length) return;

    try {
      setCreating(true);
      setBusy(true);
      const result = await createAccount({ name: name.trim(), email: email.trim(), password, role });
      const { user, roleId } = result;
      finish(roleId || user.role, user);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to create account.' });
      setBusy(false);
      setCreating(false);
    }
  };

  return (
    <div className="login">
      <div className="login__brand">
        <span className="sidebar__logo"><GraduationCap size={26} /></span>
        <h1>SchoolFix AI</h1>
        <p>Report, track, and resolve school facility and equipment problems.</p>
      </div>

      <div className="login__panel">
        <div className="card login__card">
          <h2>Sign in</h2>
          <p className="muted">Use a demo account or create a new account.</p>

          {message && <Alert type={message.type}>{message.text}</Alert>}

          <form onSubmit={onSubmit} noValidate>
            <Field label="Email" htmlFor="email" error={errors.email} required>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password} required>
              <div className="input-group">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              Sign in
            </button>
          </form>

          <div className="demo-accounts">
            <h3>Create account</h3>
            <form onSubmit={onCreateAccount} noValidate className="stack">
              <Field label="Full name" htmlFor="name" error={errors.name} required>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field label="Role" htmlFor="role">
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLE_LIST.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </Field>

              <button type="submit" className="btn btn--secondary btn--block" disabled={busy || creating}>
                {creating ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>

          <div className="demo-accounts">
            <h3>Demo accounts</h3>
            <p className="muted">Password for all: <code>{DEMO_PASSWORD}</code>. Or click one to sign in.</p>
            <div className="demo-accounts__list">
              {ROLE_LIST.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={busy}
                  onClick={() => finish(r.id, r.user)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
