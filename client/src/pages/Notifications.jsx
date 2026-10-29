import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/common/States.jsx';
import useFetch from '../hooks/useFetch.js';
import {
  dismissNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/api.js';
import { useRole } from '../context/RoleContext.jsx';
import { formatDateTime } from '../utils/format.js';

export default function Notifications() {
  const { roleId } = useRole();
  const { data, loading, error, reload } = useFetch(() => getNotifications(roleId), [roleId]);
  const [tab, setTab] = useState('all');

  const all = data || [];
  const unread = all.filter((n) => !n.read).length;
  const list = tab === 'unread' ? all.filter((n) => !n.read) : all;

  const run = async (fn) => {
    await fn();
    reload(true);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread`}
        actions={
          <button type="button" className="btn btn--secondary" disabled={unread === 0} onClick={() => run(() => markAllNotificationsRead(roleId))}>
            <CheckCheck size={18} /> Mark all as read
          </button>
        }
      />

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>
          All
        </button>
        <button type="button" role="tab" aria-selected={tab === 'unread'} className={tab === 'unread' ? 'is-active' : ''} onClick={() => setTab('unread')}>
          Unread
        </button>
      </div>

      {loading && <LoadingState label="Loading notifications..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && list.length === 0 && (
        <EmptyState
          icon={Bell}
          title={tab === 'unread' ? 'No unread notifications' : 'You have no notifications'}
          message="New updates about your reports will appear here."
        />
      )}

      {data && list.length > 0 && (
        <ul className="card card--flush notif-list">
          {list.map((n) => (
            <li key={n.id} className={n.read ? '' : 'is-unread'}>
              <span className="notif-dot" aria-label={n.read ? 'Read' : 'Unread'} />
              <div className="notif-body">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>
                  {formatDateTime(n.createdAt)}
                  {n.issueId && (
                    <>
                      {' · '}
                      <Link className="link" to={`/issues/${n.issueId}`}>View {n.issueId}</Link>
                    </>
                  )}
                </small>
              </div>
              <div className="row">
                {!n.read && (
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => run(() => markNotificationRead(n.id))}>
                    Mark as read
                  </button>
                )}
                <button type="button" className="icon-btn" aria-label={`Dismiss ${n.title}`} onClick={() => run(() => dismissNotification(n.id, roleId))}>
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
