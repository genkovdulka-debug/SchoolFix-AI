import { slug, formatDateTime } from '../../utils/format.js';

export default function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((t) => (
        <li key={t.id} className="timeline__item">
          <span className={`timeline__dot dot--${slug(t.status)}`} />
          <div>
            <strong>{t.text}</strong>
            <p>{t.author} · {formatDateTime(t.date)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
