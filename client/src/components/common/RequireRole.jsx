import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useRole } from '../../context/RoleContext.jsx';
import { EmptyState } from './States.jsx';

// UI-only guard for the demo. Real permissions must be enforced by the backend later.
export default function RequireRole({ roles, children }) {
  const { roleId, role } = useRole();
  if (roles.includes(roleId)) return children;
  return (
    <EmptyState
      icon={Lock}
      title="Not available for your role"
      message={`This page is not part of the ${role.label} menu.`}
      action={<Link className="btn btn--primary" to="/dashboard">Back to Dashboard</Link>}
    />
  );
}
