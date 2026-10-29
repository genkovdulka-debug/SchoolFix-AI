import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import Modal from '../components/common/Modal.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import useFetch from '../hooks/useFetch.js';
import { addCategory, deleteCategory, getCategories, getTeams } from '../services/api.js';

const EMPTY = { name: '', defaultTeam: '', description: '' };

export default function AdminCategories() {
  const { data, loading, error, reload } = useFetch(getCategories, []);
  const teams = useFetch(getTeams, []);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const close = () => {
    setOpen(false);
    setValues(EMPTY);
    setErrors({});
    setFormError('');
  };

  const onAdd = async (e) => {
    e.preventDefault();
    const next = {};
    if (values.name.trim().length < 3) next.name = 'Enter a category name (at least 3 characters).';
    if (!values.defaultTeam) next.defaultTeam = 'Select the responsible team.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    try {
      await addCategory(values);
      close();
      setNotice(`Category "${values.name.trim()}" was added.`);
      reload(true);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const confirmDelete = async () => {
    await deleteCategory(toDelete.id);
    setNotice(`Category "${toDelete.name}" was deleted.`);
    setToDelete(null);
    reload(true);
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Issue categories and the team that handles each one."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
            <Plus size={18} /> Add category
          </button>
        }
      />

      {notice && <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>}
      {loading && <LoadingState label="Loading categories..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="card card--flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Default team</th><th>Description</th><th>Reports</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.defaultTeam}</td>
                    <td>{c.description}</td>
                    <td>{c.issueCount}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        disabled={c.issueCount > 0}
                        title={c.issueCount > 0 ? 'Categories with reports cannot be deleted' : 'Delete category'}
                        onClick={() => setToDelete(c)}
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
        title="Add category"
        onClose={close}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={close}>Cancel</button>
            <button type="submit" form="category-form" className="btn btn--primary">Add category</button>
          </>
        }
      >
        {formError && <Alert type="error">{formError}</Alert>}
        <form id="category-form" className="form form--tight" onSubmit={onAdd} noValidate>
          <Field label="Name" htmlFor="c-name" error={errors.name} required>
            <input id="c-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </Field>
          <Field label="Default team" htmlFor="c-team" error={errors.defaultTeam} required>
            <select id="c-team" value={values.defaultTeam} onChange={(e) => setValues({ ...values, defaultTeam: e.target.value })}>
              <option value="">Select a team</option>
              {(teams.data || []).map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Description" htmlFor="c-desc">
            <input id="c-desc" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <Modal
        open={!!toDelete}
        title="Delete category"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setToDelete(null)}>Cancel</button>
            <button type="button" className="btn btn--danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Delete the category <strong>{toDelete && toDelete.name}</strong>? This cannot be undone.</p>
      </Modal>
    </>
  );
}
