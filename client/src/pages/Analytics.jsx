import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, FileText, UserX } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { ErrorState, LoadingState } from '../components/common/States.jsx';
import BarList from '../components/dashboard/BarList.jsx';
import useFetch from '../hooks/useFetch.js';
import { getIssues } from '../services/api.js';
import { useRole } from '../context/RoleContext.jsx';
import { PRIORITIES, STATUSES } from '../data/mockData.js';
import { countBy } from '../utils/format.js';

export default function Analytics() {
  const { roleId, user } = useRole();
  const { data, loading, error, reload } = useFetch(
    () => getIssues({ roleId, userId: user.id, mode: 'authorized' }),
    [roleId, user.id]
  );

  const stats = useMemo(() => {
    if (!data) return null;
    const done = data.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;
    return {
      total: data.length,
      rate: data.length ? Math.round((done / data.length) * 100) : 0,
      criticalOpen: data.filter((i) => i.priority === 'Critical' && !['Resolved', 'Closed'].includes(i.status)).length,
      unassigned: data.filter((i) => !i.assignedTeam).length,
      byStatus: STATUSES.map((s) => ({ label: s, value: data.filter((i) => i.status === s).length })),
      byPriority: PRIORITIES.map((p) => ({ label: p, value: data.filter((i) => i.priority === p).length })),
      byCategory: countBy(data, (i) => i.category),
      byTeam: countBy(data, (i) => i.assignedTeam || 'Unassigned'),
    };
  }, [data]);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Statistics calculated from the current demo reports." />
      {loading && <LoadingState label="Calculating statistics..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {stats && (
        <>
          <div className="grid-stats">
            <StatCard label="Total reports" value={stats.total} icon={FileText} tone="blue" />
            <StatCard label="Resolution rate" value={`${stats.rate}%`} icon={CheckCircle2} tone="green" />
            <StatCard label="Critical and open" value={stats.criticalOpen} icon={AlertTriangle} tone="red" />
            <StatCard label="Unassigned" value={stats.unassigned} icon={UserX} tone="amber" />
          </div>

          <div className="grid-even">
            <section className="card"><h2 className="card__title">By status</h2><BarList items={stats.byStatus} /></section>
            <section className="card"><h2 className="card__title">By priority</h2><BarList items={stats.byPriority} /></section>
            <section className="card"><h2 className="card__title">By category</h2><BarList items={stats.byCategory} /></section>
            <section className="card"><h2 className="card__title">By team</h2><BarList items={stats.byTeam} /></section>
          </div>
        </>
      )}
    </>
  );
}
