import { Search } from 'lucide-react';
import { STATUSES } from '../../data/mockData.js';

export default function IssueFilters({ filters, categories, onChange, onReset }) {
  const active = filters.search || filters.status || filters.category;
  return (
    <div className="card filters">
      <div className="filters__search">
        <Search size={16} />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search by title or report ID"
          aria-label="Search by title or report ID"
        />
      </div>
      <select value={filters.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Filter by status">
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={filters.category} onChange={(e) => onChange({ category: e.target.value })} aria-label="Filter by category">
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button type="button" className="btn btn--secondary" onClick={onReset} disabled={!active}>
        Clear filters
      </button>
    </div>
  );
}
