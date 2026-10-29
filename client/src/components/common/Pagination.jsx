export default function Pagination({ page, pageCount, total, pageSize, onChange }) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span>Showing {start}-{end} of {total}</span>
      <div className="row">
        <button type="button" className="btn btn--secondary btn--sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {pageCount}</span>
        <button type="button" className="btn btn--secondary btn--sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
