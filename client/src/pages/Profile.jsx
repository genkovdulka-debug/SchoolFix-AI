import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import { Alert } from '../components/common/States.jsx';
import { useRole } from '../context/RoleContext.jsx';

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Enter your full name.';
  if (v.phone.trim() && !/^[0-9+()\s-]{7,20}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number.';
  if (v.department.trim().length < 2) e.department = 'Enter your department or grade.';
  return e;
}

export default function Profile() {
  const { user, role, roleId, updateProfile } = useRole();
  const [values, setValues] = useState({ name: user.name, phone: user.phone, department: user.department });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues({ name: user.name, phone: user.phone, department: user.department });
    setErrors({});
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const set = (field) => (e) => {
    setSaved(false);
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    updateProfile({ name: values.name.trim(), phone: values.phone.trim(), department: values.department.trim() });
    setSaved(true);
  };

  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details (demo data stored in this browser)." />

      <div className="grid-2">
        <section className="card">
          <div className="profile-head">
            <span className="profile-avatar" aria-hidden="true">{initials}</span>
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{role.label}</p>
            </div>
          </div>
          <dl className="details">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Role</dt><dd>{role.label}</dd></div>
            <div><dt>Department</dt><dd>{user.department}</dd></div>
            <div><dt>Phone</dt><dd>{user.phone || 'Not provided'}</dd></div>
            <div><dt>Account ID</dt><dd className="mono">{user.id}</dd></div>
            <div><dt>Account status</dt><dd>Active (demo)</dd></div>
          </dl>
        </section>

        <section className="card">
          <h2 className="card__title">Edit profile</h2>
          {saved && <Alert type="success" onClose={() => setSaved(false)}>Profile saved.</Alert>}
          <form className="form form--tight" onSubmit={onSubmit} noValidate>
            <Field label="Display name" htmlFor="name" error={errors.name} required>
              <input id="name" value={values.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <input id="phone" value={values.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
            </Field>
            <Field label="Department or grade" htmlFor="department" error={errors.department} required>
              <input id="department" value={values.department} onChange={set('department')} aria-invalid={!!errors.department} aria-describedby={errors.department ? 'department-error' : undefined} />
            </Field>
            <button type="submit" className="btn btn--primary">Save changes</button>
          </form>
        </section>
      </div>
    </>
  );
}
