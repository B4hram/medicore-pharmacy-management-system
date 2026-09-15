
function StatusBadge({
  status,
  variant = 'success',
}) {
  return (
    <span className={`status-badge ${variant}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

export default StatusBadge;

