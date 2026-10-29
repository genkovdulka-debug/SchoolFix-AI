import { useState } from 'react';
import { UserCheck, UserPlus, Users, UserX } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import Modal from '../components/common/Modal.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import useFetch from '../hooks/useFetch.js';
import { addUser, getUsers, updateUser } from '../services/api.js';
import { ROLE_LABELS, ROLE_LIST } from '../data/roles.js';

const EMPTY = { name: '', email: '', role: 'student' };

export default function AdminUsers() {
  const { data, loading, error, reload } = useFetch(getUsers, []);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const close = () => {
    setOpen(false);
    setValues(EMPTY);
    setErrors({});
    setFormError('');
  };

  const onAdd = async (e) => {
    e.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Enter the full name.';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    try {
      await addUser(values);
      close();
      setNotice(`${values.name.trim()} was added as ${ROLE_LABELS[values.role]}.`);
      reload(true);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const changeRole = async (user, role) => {
    await updateUser(user.id, { role });
    setNotice(`${user.name} is now ${ROLE_LABELS[role]}.`);
    reload(true);
  };

  const toggleActive = async (user) => {
    await updateUser(user.id, { active: !user.active });
    setNotice(`${user.name} was ${user.active ? 'deactivated' : 'activated'}.`);
    reload(true);
  };

  const active = data ? data.filter((u) => u.active).length : 0;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage demo accounts and roles."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
            <UserPlus size={18} /> Add user
          </button>
        }
      />

      {notice && <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>}
      {loading && <LoadingState label="Loading users..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid-stats">
            <StatCard label="Total users" value={data.length} icon={Users} tone="blue" />
            <StatCard label="Active" value={active} icon={UserCheck} tone="green" />
            <StatCard label="Inactive" value={data.length - active} icon={UserX} tone="gray" />
          </div>

          <div className="card card--flush">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Role for ${u.name}`}>
                          {ROLE_LIST.map((r) => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button type="button" className="btn btn--secondary btn--sm" onClick={() => toggleActive(u)}>
                          {u.active ? 'Active (deactivate)' : 'Inactive (activate)'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal
        open={open}
        title="Add user"
        onClose={close}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={close}>Cancel</button>
            <button type="submit" form="user-form" className="btn btn--primary">Add user</button>
          </>
        }
      >
        {formError && <Alert type="error">{formError}</Alert>}
        <form id="user-form" className="form form--tight" onSubmit={onAdd} noValidate>
          <Field label="Full name" htmlFor="u-name" error={errors.name} required>
            <input id="u-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </Field>
          <Field label="Email" htmlFor="u-email" error={errors.email} required>
            <input id="u-email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
          </Field>
          <Field label="Role" htmlFor="u-role">
            <select id="u-role" value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}>
              {ROLE_LIST.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </Field>
        </form>
      </Modal>
    </>
  );
}
