// Demo roles and demo users. This is NOT real authentication or security.
export const DEMO_PASSWORD = 'demo1234';

export const ROLES = {
  student: {
    id: 'student',
    label: 'Student',
    user: { id: 'u1', name: 'Maria Santos', email: 'maria.santos@school.demo', phone: '0917 000 0001', department: 'Grade 11 - STEM' },
  },
  teacher: {
    id: 'teacher',
    label: 'Teacher',
    user: { id: 'u2', name: 'Daniel Reyes', email: 'daniel.reyes@school.demo', phone: '0917 000 0002', department: 'Science Department' },
  },
  it_support: {
    id: 'it_support',
    label: 'IT Support',
    user: { id: 'u3', name: 'Alex Cruz', email: 'alex.cruz@school.demo', phone: '0917 000 0003', department: 'IT Support Team' },
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance Staff',
    user: { id: 'u4', name: 'Joel Ramos', email: 'joel.ramos@school.demo', phone: '0917 000 0004', department: 'Maintenance Team' },
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    user: { id: 'u5', name: 'Elena Garcia', email: 'elena.garcia@school.demo', phone: '0917 000 0005', department: 'School Administration' },
  },
};

export const ROLE_LIST = Object.values(ROLES);
export const ROLE_LABELS = Object.fromEntries(ROLE_LIST.map((r) => [r.id, r.label]));
export const DEFAULT_ROLE = 'student';
