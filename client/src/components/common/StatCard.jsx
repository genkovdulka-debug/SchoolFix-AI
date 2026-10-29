export default function StatCard({ label, value, icon: Icon, tone = 'blue' }) {
  return (
    <div className="card stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}
