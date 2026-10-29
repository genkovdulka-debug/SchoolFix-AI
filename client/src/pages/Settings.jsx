import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import Modal from '../components/common/Modal.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import useFetch from '../hooks/useFetch.js';
import { getSettings, resetDemoData, saveSettings } from '../services/api.js';

export default function Settings() {
  const { data, loading, error, reload } = useFetch(getSettings, []);
  const [values, setValues] = useState(null);
  const [fieldError, setFieldError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const onSave = async (e) => {
    e.preventDefault();
    const days = Number(values.overdueDays);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      setFieldError('Enter a whole number of days between 1 and 30.');
      return;
    }
    setFieldError('');
    await saveSettings({ ...values, overdueDays: days });
    setNotice('Settings saved.');
    reload(true);
  };

  const onReset = async () => {
    await resetDemoData();
    setConfirmReset(false);
    setNotice('Demo data was reset to the original sample reports.');
    reload(true);
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Demo preferences stored in this browser." />
      {notice && <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>}
      {loading && <LoadingState label="Loading settings..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {values && (
        <div className="grid-even">
          <form className="card form" onSubmit={onSave} noValidate>
            <h2 className="card__title">Workflow rules</h2>
            <Field label="Flag issues as overdue after (days)" htmlFor="overdue" error={fieldError} hint="Used by the overdue tracking feature in a later phase.">
              <input
                id="overdue"
                type="number"
                min="1"
                max="30"
                value={values.overdueDays}
                onChange={(e) => setValues({ ...values, overdueDays: e.target.value })}
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? 'overdue-error' : undefined}
              />
            </Field>
            <label className="check">
              <input type="checkbox" checked={values.notifyOnAssignment} onChange={(e) => setValues({ ...values, notifyOnAssignment: e.target.checked })} />
              Notify users when a report is assigned
            </label>
            <label className="check">
              <input type="checkbox" checked={values.notifyOnStatusChange} onChange={(e) => setValues({ ...values, notifyOnStatusChange: e.target.checked })} />
              Notify users when a status changes
            </label>
            <div className="form__actions">
              <button type="submit" className="btn btn--primary">Save settings</button>
            </div>
          </form>

          <section className="card">
            <h2 className="card__title">Demo data</h2>
            <p className="muted section-gap-sm">
              Reports, users, categories, and teams are saved in your browser so changes survive a refresh.
              Resetting restores the original sample data.
            </p>
            <button type="button" className="btn btn--danger" onClick={() => setConfirmReset(true)}>
              Reset demo data
            </button>
          </section>
        </div>
      )}

      <Modal
        open={confirmReset}
        title="Reset demo data"
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button type="button" className="btn btn--danger" onClick={onReset}>Reset</button>
          </>
        }
      >
        <p>This removes every report, user, category, and team you added or changed and restores the original samples.</p>
      </Modal>
    </>
  );
}
