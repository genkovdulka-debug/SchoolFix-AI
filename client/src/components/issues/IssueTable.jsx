import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge.jsx';
import { formatDate } from '../../utils/format.js';

export default function IssueTable({ issues }) {
  return (
    <div className="table-wrap">
      <table className="table table--stack">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Reported</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.id}>
              <td data-label="ID" className="mono">{i.id}</td>
              <td data-label="Title">
                <Link className="link" to={`/issues/${i.id}`}>{i.title}</Link>
              </td>
              <td data-label="Category">{i.category}</td>
              <td data-label="Location">{i.building}, {i.room}</td>
              <td data-label="Priority"><PriorityBadge priority={i.priority} /></td>
              <td data-label="Status"><StatusBadge status={i.status} /></td>
              <td data-label="Reported">{formatDate(i.createdAt)}</td>
              <td>
                <Link className="btn btn--secondary btn--sm" to={`/issues/${i.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
