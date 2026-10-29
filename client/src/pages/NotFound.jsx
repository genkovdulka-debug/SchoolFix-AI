import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" subtitle="That address does not exist." />
      <div className="card empty-state">
        <p>Check the URL or go back to your dashboard.</p>
        <Link className="btn btn--primary" to="/dashboard">
          Go to Dashboard
        </Link>
      </div>
    </>
  );
}
