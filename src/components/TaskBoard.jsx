import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../api';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';

const TABS = ['Pending', 'Completed', 'Expired'];
const REFRESH_MS = 15000; // picks up expiries done by the backend

export default function TaskBoard({ email, onSignOut }) {
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const [showSubscriptionHint, setShowSubscriptionHint] = useState(true);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      setTasks(await api.listTasks());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(() => load({ quiet: true }), REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((s) => [s, tasks.filter((t) => t.status === s).length])),
    [tasks],
  );

  const visible = useMemo(() => {
    const list = tasks.filter((t) => t.status === tab);
    if (tab === 'Pending') return [...list].sort((a, b) => (a.deadlineEpoch ?? 0) - (b.deadlineEpoch ?? 0));
    const key = tab === 'Completed' ? 'completedAt' : 'expiredAt';
    return [...list].sort((a, b) => (b[key] || b.updatedAt || '').localeCompare(a[key] || a.updatedAt || ''));
  }, [tasks, tab]);

  // Runs an API action, shows the result, then refreshes from the server.
  const run = useCallback(
    async (action, message) => {
      try {
        await action();
        setNotice(message);
        setError('');
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        await load({ quiet: true });
      }
    },
    [load],
  );

  const handlers = {
    onCreate: (data) => run(() => api.createTask(data), 'Task created').then(() => setTab('Pending')),
    onUpdate: (id, changes) => run(() => api.updateTask(id, changes), 'Task updated'),
    onComplete: (id) => run(() => api.completeTask(id), 'Task completed'),
    onDelete: (id) => run(() => api.deleteTask(id), 'Task deleted'),
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo small" aria-hidden="true">✓</span>
          <span>To-Do</span>
        </div>
        <div className="account">
          <span className="email" title={email}>{email}</span>
          <button className="btn ghost" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <main className="content">
        {showSubscriptionHint && (
          <div className="banner info">
            <span>
              Expiry alerts are sent by email. If this is your first sign-in, open the
              <strong> “AWS Notification – Subscription Confirmation”</strong> email and click
              <strong> Confirm subscription</strong>.
            </span>
            <button className="icon-btn" aria-label="Dismiss" onClick={() => setShowSubscriptionHint(false)}>×</button>
          </div>
        )}

        <TaskForm onCreate={handlers.onCreate} />

        <nav className="tabs" role="tablist">
          {TABS.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={tab === s}
              className={`tab ${tab === s ? 'active' : ''} tab-${s.toLowerCase()}`}
              onClick={() => setTab(s)}
            >
              {s}
              <span className="count">{counts[s]}</span>
            </button>
          ))}
          <button className="btn ghost refresh" onClick={() => load()} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </nav>

        {error && <div className="banner error" role="alert">{error}</div>}
        {notice && <div className="banner success" role="status">{notice}</div>}

        <section className="task-list">
          {!loading && visible.length === 0 && (
            <p className="empty">
              {tab === 'Pending' ? 'No pending tasks. Add one above.' : `No ${tab.toLowerCase()} tasks yet.`}
            </p>
          )}
          {visible.map((task) => (
            <TaskCard key={task.taskId} task={task} now={now} {...handlers} />
          ))}
        </section>
      </main>
    </div>
  );
}
