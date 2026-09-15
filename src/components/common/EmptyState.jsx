
import { Inbox } from 'lucide-react';

function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There is currently no information to display.',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

