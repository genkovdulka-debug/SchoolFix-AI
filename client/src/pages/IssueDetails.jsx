import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import { PriorityBadge, StatusBadge } from '../components/common/Badge.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import Timeline from '../components/issues/Timeline.jsx';
import useFetch from '../hooks/useFetch.js';
import { getIssue, getTeams, updateIssue } from '../services/api.js';
import { STATUSES } from '../data/mockData.js';
import { useRole } from '../context/RoleContext.jsx';
import { formatDate, formatDateTime } from '../utils/format.js';

const MANAGERS = ['it_support', 'maintenance', 'admin'];

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roleId, user } = useRole();
  const { data: issue, loading, error, reload } = useFetch(
    () => getIssue(id, { roleId, userId: user.id }),
    [id, roleId, user.id]
  );
  const teams = useFetch(getTeams, []);

  const canManage = MANAGERS.includes(roleId);
  const isAdmin = roleId === 'admin';
  const [status, setStatus] = useState('');
  const [team, setTeam] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (issue) {
      setStatus(issue.status);
      setTeam(issue.assignedTeam || '');
    }
  }, [issue]);

  const back = (
    <button type="button" className="btn btn--secondary" onClick={() => navigate(-1)}>
      <ArrowLeft size={18} /> Back
    </button>
  );

  if (loading) return <LoadingState label="Loading report..." />;
  if (error) {
    return (
      <>
        <PageHeader title="Report" actions={back} />
        <ErrorState message={error} />
      </>
    );
  }
  if (!issue) return null;

  const onUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    const statusChanged = status !== issue.status;
    const teamChanged = isAdmin && team && team !== (issue.assignedTeam || '');
    const hasNote = note.trim().length > 0;

    if (status === 'Resolved' && statusChanged && !hasNote) {
      setFormError('Add a resolution note when marking an issue as Resolved.');
      return;
    }
    if (!statusChanged && !teamChanged && !hasNote) {
      setFormError('Change the status or team, or add a note first.');
      return;
    }
    setSaving(true);
    try {
      await updateIssue(
        issue.id,
        { status: statusChanged ? status : undefined, team: teamChanged ? team : undefined, note: note.trim() },
        user.name
      );
      setNote('');
      setSuccess('The report was updated.');
      reload(true);
    } catch (err) {
      setFormError(err.message || 'The update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={issue.title}
        subtitle={`${issue.id} · Reported ${formatDate(issue.createdAt)}`}
        actions={back}
      />

      <div className="grid-2">
        <div className="stack">
          <section className="card">
            <div className="row section-gap-sm">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
            <p className="prose">{issue.description}</p>
            <dl className="details">
              <div><dt>Category</dt><dd>{issue.category}</dd></div>
              <div><dt>Location</dt><dd>{issue.building}, Room {issue.room}</dd></div>
              <div><dt>Reported by</dt><dd>{issue.reportedByName}</dd></div>
              <div><dt>Reported date</dt><dd>{formatDateTime(issue.createdAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDateTime(issue.updatedAt)}</dd></div>
              <div><dt>Assigned team</dt><dd>{issue.assignedTeam || 'Not assigned yet'}</dd></div>
              <div><dt>Assigned staff</dt><dd>{issue.assignedToName || 'Not assigned yet'}</dd></div>
              {issue.imageName && <div><dt>Attached photo</dt><dd>{issue.imageName}</dd></div>}
            </dl>
          </section>

          <section className="card">
            <h2 className="card__title">Resolution</h2>
            {issue.resolution ? <p className="prose">{issue.resolution}</p> : <p className="muted">This issue has not been resolved yet.</p>}
          </section>

          <section className="card">
            <h2 className="card__title">Work notes</h2>
            {issue.notes.length === 0 ? (
              <p className="muted">No work notes yet.</p>
            ) : (
              <ul className="activity">
                {issue.notes.map((n) => (
                  <li key={n.id}>
                    <p>{n.text}</p>
                    <small>{n.author} · {formatDateTime(n.date)}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="stack">
          <section className="card">
            <h2 className="card__title">Progress timeline</h2>
            <Timeline items={issue.timeline} />
          </section>

          {canManage && (
            <section className="card">
              <h2 className="card__title">Update this report</h2>
              {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
              {formError && <Alert type="error">{formError}</Alert>}
              <form className="form form--tight" onSubmit={onUpdate} noValidate>
                <Field label="Status" htmlFor="status">
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>

                {isAdmin && (
                  <Field label="Assigned team" htmlFor="team">
                    <select id="team" value={team} onChange={(e) => setTeam(e.target.value)}>
                      <option value="">Not assigned</option>
                      {(teams.data || []).map((t) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label="Work note or resolution" htmlFor="note" hint="Required when marking an issue as Resolved.">
                  <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>

                <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
                  {saving ? 'Saving...' : 'Save update'}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
