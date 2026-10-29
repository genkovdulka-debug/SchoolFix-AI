import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Clock, FileText, Inbox, ListChecks, PlusCircle } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { StatusBadge } from '../components/common/Badge.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import BarList from '../components/dashboard/BarList.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import useFetch from '../hooks/useFetch.js';
import { getIssues } from '../services/api.js';
import { useRole } from '../context/RoleContext.jsx';
import { countBy, formatDate } from '../utils/format.js';

function getCopy(roleId) {
  if (roleId === 'admin') {
    return { subtitle: 'Overview of every report in the system.', to: '/issues', label: 'Review All Issues', icon: ListChecks };
  }
  if (roleId === 'it_support' || roleId === 'maintenance') {
    return { subtitle: 'Reports for your team and issues assigned to you.', to: '/assigned', label: 'View Assigned Issues', icon: ClipboardList };
  }
  return { subtitle: 'Track the problems you have reported.', to: '/report', label: 'Report an Issue', icon: PlusCircle };
}

export default function Dashboard() {
  const { roleId, user } = useRole();
  const copy = getCopy(roleId);
  const { data, loading, error, reload } = useFetch(
    () => getIssues({ roleId, userId: user.id, mode: 'authorized' }),
    [roleId, user.id]
  );

  const stats = useMemo(() => {
    if (!data) return null;
    const count = (list) => data.filter((i) => list.includes(i.status)).length;
    return {
      total: data.length,
      open: count(['Submitted', 'Assigned']),
      progress: count(['In Progress']),
      resolved: count(['Resolved', 'Closed']),
      unassigned: data.filter((i) => !i.assignedTeam).length,
    };
  }, [data]);

  const activity = useMemo(() => {
    if (!data) return [];
    return data
      .flatMap((i) => i.timeline.map((t) => ({ ...t, issueId: i.id })))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [data]);

  const ActionIcon = copy.icon;
  const actionButton = (
    <Link className="btn btn--primary" to={copy.to}>
      <ActionIcon size={18} />
      {copy.label}
    </Link>
  );

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} subtitle={copy.subtitle} actions={actionButton} />

      {loading && <LoadingState label="Loading dashboard..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && stats && (
        <>
          {roleId === 'admin' && stats.unassigned > 0 && (
            <Alert type="info">
              {stats.unassigned} report{stats.unassigned === 1 ? '' : 's'} still need a team assignment.{' '}
              <Link className="link" to="/issues">Review issues</Link>
            </Alert>
          )}

          <div className="grid-stats">
            <StatCard label="Total reported issues" value={stats.total} icon={FileText} tone="blue" />
            <StatCard label="Open issues" value={stats.open} icon={Inbox} tone="gray" />
            <StatCard label="In progress" value={stats.progress} icon={Clock} tone="amber" />
            <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="green" />
          </div>

          <div className="grid-2">
            <section className="card">
              <h2 className="card__title">Recent reports</h2>
              {data.length === 0 ? (
                <p className="muted">No reports yet.</p>
              ) : (
                <ul className="recent-list">
                  {data.slice(0, 5).map((i) => (
                    <li key={i.id}>
                      <div>
                        <Link className="link" to={`/issues/${i.id}`}>{i.title}</Link>
                        <small>{i.id} · {i.building}, {i.room} · {formatDate(i.createdAt)}</small>
                      </div>
                      <StatusBadge status={i.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h2 className="card__title">Issues by category</h2>
              <BarList items={countBy(data, (i) => i.category)} />
            </section>
          </div>

          <section className="card section-gap">
            <h2 className="card__title">Recent activity</h2>
            <RecentActivity items={activity} />
          </section>
        </>
      )}
    </>
  );
}
