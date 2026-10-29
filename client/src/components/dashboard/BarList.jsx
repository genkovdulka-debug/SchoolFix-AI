export default function BarList({ items, emptyText = 'No data yet.' }) {
  if (!items.length) return <p className="muted">{emptyText}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="bars">
      {items.map((item) => (
        <li key={item.label}>
          <div className="bars__row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bars__track">
            <div className="bars__fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
