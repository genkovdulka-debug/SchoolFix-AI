import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import Modal from '../components/common/Modal.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import useFetch from '../hooks/useFetch.js';
import { addTeam, deleteTeam, getTeams, getUsers } from '../services/api.js';

const EMPTY = { name: '', leadId: '', handles: '' };

export default function AdminTeams() {
  const { data, loading, error, reload } = useFetch(getTeams, []);
  const users = useFetch(getUsers, []);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const leads = (users.data || []).filter((u) => u.active && (u.role === 'it_support' || u.role === 'maintenance'));

  const close = () => {
    setOpen(false);
    setValues(EMPTY);
    setErrors({});
    setFormError('');
  };

  const onAdd = async (e) => {
    e.preventDefault();
    const next = {};
    if (values.name.trim().length < 3) next.name = 'Enter a team name (at least 3 characters).';
    if (!values.leadId) next.leadId = 'Select a team lead.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    try {
      await addTeam(values);
      close();
      setNotice(`Team "${values.name.trim()}" was added.`);
      reload(true);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const confirmDelete = async () => {
    await deleteTeam(toDelete.id);
    setNotice(`Team "${toDelete.name}" was deleted.`);
    setToDelete(null);
    reload(true);
  };

  return (
    <>
      <PageHeader
        title="Teams"
        subtitle="Teams that receive and resolve reports."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
            <Plus size={18} /> Add team
          </button>
        }
      />

      {notice && <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>}
      {loading && <LoadingState label="Loading teams..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="card card--flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Team</th><th>Lead</th><th>Members</th><th>Handles</th><th>Open issues</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.leadName}</td>
                    <td>{t.members}</td>
                    <td>{t.handles}</td>
                    <td>{t.openIssues}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        disabled={t.totalIssues > 0}
                        title={t.totalIssues > 0 ? 'Teams with assigned reports cannot be deleted' : 'Delete team'}
                        onClick={() => setToDelete(t)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        title="Add team"
        onClose={close}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={close}>Cancel</button>
            <button type="submit" form="team-form" className="btn btn--primary">Add team</button>
          </>
        }
      >
        {formError && <Alert type="error">{formError}</Alert>}
        <form id="team-form" className="form form--tight" onSubmit={onAdd} noValidate>
          <Field label="Team name" htmlFor="t-name" error={errors.name} required>
            <input id="t-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </Field>
          <Field label="Team lead" htmlFor="t-lead" error={errors.leadId} required hint="Only active IT Support and Maintenance users can lead a team.">
            <select id="t-lead" value={values.leadId} onChange={(e) => setValues({ ...values, leadId: e.target.value })}>
              <option value="">Select a lead</option>
              {leads.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <Field label="What this team handles" htmlFor="t-handles">
            <input id="t-handles" value={values.handles} onChange={(e) => setValues({ ...values, handles: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <Modal
        open={!!toDelete}
        title="Delete team"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setToDelete(null)}>Cancel</button>
            <button type="button" className="btn btn--danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Delete the team <strong>{toDelete && toDelete.name}</strong>? This cannot be undone.</p>
      </Modal>
    </>
  );
}
