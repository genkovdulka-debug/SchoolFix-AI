import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLE_LIST } from '../../data/roles.js';
import { useRole } from '../../context/RoleContext.jsx';

export default function Header({ onMenuClick }) {
  const { user, role, roleId, setRole, logout } = useRole();
  const navigate = useNavigate();
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <button type="button" className="icon-btn header__menu" onClick={onMenuClick} aria-label="Open navigation">
        <Menu size={22} />
      </button>

      <div className="header__spacer" />

      <label className="role-select">
        <span className="role-select__label">Demo role</span>
        <select value={roleId} onChange={(e) => setRole(e.target.value)}>
          {ROLE_LIST.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <div className="user-chip">
        <span className="user-chip__avatar" aria-hidden="true">{initials}</span>
        <span className="user-chip__text">
          <strong>{user.name}</strong>
          <small>{role.label}</small>
        </span>
      </div>

      <button type="button" className="btn btn--secondary btn--sm" onClick={handleLogout}>
        <LogOut size={16} />
        <span className="hide-mobile">Log out</span>
      </button>
    </header>
  );
}
