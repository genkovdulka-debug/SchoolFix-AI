import { NavLink } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';
import { NAV_BY_ROLE } from '../../data/navigation.js';
import { useRole } from '../../context/RoleContext.jsx';

export default function Sidebar({ open, onClose }) {
  const { roleId, role } = useRole();
  const items = NAV_BY_ROLE[roleId];

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <GraduationCap size={22} />
          </span>
          <span className="sidebar__title">SchoolFix AI</span>
          <button
            type="button"
            className="icon-btn sidebar__close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <p className="sidebar__role">{role.label}</p>

        <nav className="sidebar__nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'is-active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <p className="sidebar__footer">Demo mode: roles are for preview only.</p>
      </aside>
    </>
  );
}
