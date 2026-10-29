import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Field from '../components/common/Field.jsx';
import { Alert, ErrorState, LoadingState } from '../components/common/States.jsx';
import useFetch from '../hooks/useFetch.js';
import { createIssue, getCategories } from '../services/api.js';
import { BUILDINGS } from '../data/mockData.js';
import { useRole } from '../context/RoleContext.jsx';

const EMPTY = { title: '', description: '', category: '', building: '', room: '' };
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function validate(v) {
  const e = {};
  if (v.title.trim().length < 5) e.title = 'Enter a title of at least 5 characters.';
  if (v.description.trim().length < 10) e.description = 'Describe the problem in at least 10 characters.';
  if (!v.category) e.category = 'Select a category.';
  if (!v.building) e.building = 'Select a building or location.';
  if (!v.room.trim()) e.room = 'Enter a room number or area.';
  return e;
}

export default function ReportIssue() {
  const { user } = useRole();
  const navigate = useNavigate();
  const categories = useFetch(getCategories, []);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [created, setCreated] = useState(null);
  const fileRef = useRef(null);
  const previewRef = useRef('');

  useEffect(() => () => previewRef.current && URL.revokeObjectURL(previewRef.current), []);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const clearImage = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = '';
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file (JPG, PNG, or WebP).');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('The image must be 2 MB or smaller.');
      e.target.value = '';
      return;
    }
    setImageError('');
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(file);
    setImage(file);
    setPreview(previewRef.current);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const issue = await createIssue({ ...values, imageName: image ? image.name : null }, user);
      setCreated(issue);
      setValues(EMPTY);
      clearImage();
    } catch (err) {
      setFormError(err.message || 'The report could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (f) => ({
    'aria-invalid': !!errors[f],
    'aria-describedby': errors[f] ? `${f}-error` : undefined,
  });

  return (
    <>
      <PageHeader title="Report an Issue" subtitle="Describe the problem so the right team can fix it." />

      {created && (
        <Alert type="success" onClose={() => setCreated(null)}>
          Report <strong>{created.id}</strong> was submitted.{' '}
          <Link className="link" to={`/issues/${created.id}`}>View report</Link>
        </Alert>
      )}
      {formError && <Alert type="error">{formError}</Alert>}

      {categories.loading && <LoadingState label="Loading form..." />}
      {categories.error && <ErrorState message={categories.error} onRetry={categories.reload} />}

      {categories.data && (
        <form className="card form" onSubmit={onSubmit} noValidate>
          <Field label="Issue title" htmlFor="title" error={errors.title} required>
            <input id="title" value={values.title} onChange={set('title')} placeholder="e.g. Projector not displaying" {...err('title')} />
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description} required>
            <textarea id="description" rows={4} value={values.description} onChange={set('description')} placeholder="What is wrong, and since when?" {...err('description')} />
          </Field>

          <div className="form-grid">
            <Field label="Category" htmlFor="category" error={errors.category} required>
              <select id="category" value={values.category} onChange={set('category')} {...err('category')}>
                <option value="">Select a category</option>
                {categories.data.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Building or location" htmlFor="building" error={errors.building} required>
              <select id="building" value={values.building} onChange={set('building')} {...err('building')}>
                <option value="">Select a location</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Room number" htmlFor="room" error={errors.room} required>
            <input id="room" value={values.room} onChange={set('room')} placeholder="e.g. 204" {...err('room')} />
          </Field>

          <Field label="Photo (optional)" htmlFor="image" error={imageError} hint="JPG, PNG, or WebP up to 2 MB. The preview stays on your device in this demo.">
            <input ref={fileRef} id="image" type="file" accept="image/*" onChange={onImage} />
          </Field>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview of the attached issue" />
              <button type="button" className="btn btn--secondary btn--sm" onClick={clearImage}>
                <X size={16} /> Remove image
              </button>
            </div>
          )}

          <div className="form__actions">
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              <ImagePlus size={18} />
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
