export const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// Returns [{ label, value }] sorted from largest to smallest.
export function countBy(list, getKey) {
  const counts = {};
  list.forEach((item) => {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
