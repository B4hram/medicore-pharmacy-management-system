

function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  variant = 'blue',
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${variant}`}>
          <Icon size={20} />
        </div>

        {change && (
          <span className="stat-change">
            {change}
          </span>
        )}
      </div>

      <div className="stat-content">
        <span>{title}</span>

        <strong>{value}</strong>

        {description && (
          <small>{description}</small>
        )}
      </div>
    </div>
  );
}

export default StatCard;

