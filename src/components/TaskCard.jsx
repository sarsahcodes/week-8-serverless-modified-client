import { useState } from 'react';
import { formatCountdown, formatDate, formatDateTime } from '../time';

export default function TaskCard({ task, now, onUpdate, onComplete, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(task.description);
  const [date, setDate] = useState(task.date || '');
  const [busy, setBusy] = useState(false);

  const isPending = task.status === 'Pending';
  const msLeft = (task.deadlineEpoch ?? 0) * 1000 - now;

  async function act(fn) {
    setBusy(true);
    try {
      await fn();
      return true;
    } catch {
      return false; // the board shows the error banner
    } finally {
      setBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    const changes = {};
    if (description.trim() !== task.description) changes.description = description.trim();
    if (date && date !== task.date) changes.date = date;
    if (!Object.keys(changes).length) return setEditing(false);
    if (await act(() => onUpdate(task.taskId, changes))) setEditing(false);
  }

  function startEdit() {
    setDescription(task.description);
    setDate(task.date || '');
    setEditing(true);
  }

  function cancelEdit() {
    setDescription(task.description);
    setDate(task.date || '');
    setEditing(false);
  }

  function confirmDelete() {
    if (window.confirm(`Delete "${task.description}"?`)) act(() => onDelete(task.taskId));
  }

  return (
    <article className={`card task status-${task.status.toLowerCase()}`}>
      {editing ? (
        <form className="edit" onSubmit={save}>
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required autoFocus />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <div className="actions">
            <button className="btn primary" type="submit" disabled={busy}>Save</button>
            <button className="btn ghost" type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-main">
            <h3>{task.description}</h3>
            <div className="meta">
              <span className={`pill pill-${task.status.toLowerCase()}`}>{task.status}</span>
              {task.date && <span>Due {formatDate(task.date)}</span>}
              {isPending && (
                <span className={`countdown ${msLeft <= 60000 ? 'urgent' : ''}`}>
                  {msLeft > 0 ? `Expires in ${formatCountdown(msLeft)}` : 'Deadline passed – expiring…'}
                </span>
              )}
              {task.status === 'Completed' && <span>Completed {formatDateTime(task.completedAt)}</span>}
              {task.status === 'Expired' && <span>Expired {formatDateTime(task.expiredAt || task.deadline)}</span>}
            </div>
          </div>
          <div className="actions">
            {isPending && (
              <>
                <button className="btn success" onClick={() => act(() => onComplete(task.taskId))} disabled={busy}>
                  Complete
                </button>
                <button className="btn ghost" onClick={startEdit} disabled={busy}>Edit</button>
              </>
            )}
            <button className="btn danger ghost" onClick={confirmDelete} disabled={busy}>Delete</button>
          </div>
        </>
      )}
    </article>
  );
}
