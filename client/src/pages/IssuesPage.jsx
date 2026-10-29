import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, PlusCircle, SearchX } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/common/States.jsx';
import IssueFilters from '../components/issues/IssueFilters.jsx';
import IssueTable from '../components/issues/IssueTable.jsx';
import useFetch from '../hooks/useFetch.js';
import { getIssues } from '../services/api.js';
import { useRole } from '../context/RoleContext.jsx';

const PAGE_SIZE = 8;
const NO_FILTERS = { search: '', status: '', category: '' };

function getTitle(mode, roleId) {
  if (mode === 'mine') return ['My Reports', 'Reports you have submitted.'];
  if (mode === 'assigned') return ['Assigned Issues', 'Issues assigned directly to you.'];
  if (roleId === 'admin') return ['All Issues', 'Every report in the system.'];
  if (roleId === 'it_support' || roleId === 'maintenance') {
    return ['All Authorized Issues', 'Issues for your team and issues assigned to you.'];
  }
  return ['My Reports', 'Reports you have submitted.'];
}

export default function IssuesPage({ mode }) {
  const { roleId, user } = useRole();
  const { data, loading, error, reload } = useFetch(
    () => getIssues({ roleId, userId: user.id, mode }),
    [mode, roleId, user.id]
  );
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [title, subtitle] = getTitle(mode, roleId);

  const categories = useMemo(
    () => (data ? [...new Set(data.map((i) => i.category))].sort() : []),
    [data]
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = filters.search.trim().toLowerCase();
    return data.filter(
      (i) =>
        (!q || i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)) &&
        (!filters.status || i.status === filters.status) &&
        (!filters.category || i.category === filters.category)
    );
  }, [data, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const change = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const reset = () => {
    setFilters(NO_FILTERS);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Link className="btn btn--primary" to="/report">
            <PlusCircle size={18} /> Report an Issue
          </Link>
        }
      />

      {loading && <LoadingState label="Loading reports..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState icon={ListChecks} title="No reports here yet" message="Reports that match this view will appear here." />
      )}

      {data && data.length > 0 && (
        <>
          <IssueFilters filters={filters} categories={categories} onChange={change} onReset={reset} />
          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching reports"
              message="Try a different search or clear the filters."
              action={<button type="button" className="btn btn--secondary" onClick={reset}>Clear filters</button>}
            />
          ) : (
            <div className="card card--flush">
              <IssueTable issues={visible} />
              <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </>
  );
}
