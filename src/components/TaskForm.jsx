import { useState } from 'react';
import { todayLocal } from '../time';

export default function TaskForm({ onCreate }) {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [deadlineMinutes, setDeadlineMinutes] = useState(5);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    try {
      await onCreate({ description: description.trim(), date, deadlineMinutes: Number(deadlineMinutes) });
      setDescription('');
    } catch {
      /* the board shows the error banner */
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card task-form" onSubmit={submit}>
      <label className="field grow">
        <span>New task</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs doing?"
          maxLength={500}
          required
        />
      </label>
      <label className="field">
        <span>Due date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="field narrow">
        <span>Expires in (min)</span>
        <input
          type="number"
          min={1}
          max={1440}
          value={deadlineMinutes}
          onChange={(e) => setDeadlineMinutes(e.target.value)}
          required
        />
      </label>
      <button className="btn primary" type="submit" disabled={saving || !description.trim()}>
        {saving ? 'Adding…' : 'Add task'}
      </button>
    </form>
  );
}
