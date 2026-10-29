import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/format.js';

export default function RecentActivity({ items }) {
  if (!items.length) return <p className="muted">No recent activity.</p>;
  return (
    <ul className="activity">
      {items.map((a) => (
        <li key={a.id}>
          <p>
            <strong>{a.text}</strong> on{' '}
            <Link className="link" to={`/issues/${a.issueId}`}>{a.issueId}</Link>
          </p>
          <small>{a.author} · {formatDateTime(a.date)}</small>
        </li>
      ))}
    </ul>
  );
}
