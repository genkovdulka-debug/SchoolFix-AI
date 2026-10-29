// Mock data. Later, replace the functions in services/api.js with real API calls.
export const BUILDINGS = [
  'Building A', 'Building B', 'Building C', 'Science Lab', 'Computer Lab',
  'Library', 'Gymnasium', 'Auditorium', 'Faculty Room',
];

export const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const CATEGORIES = [
  { id: 'cat-1', name: 'Furniture', defaultTeam: 'Maintenance', description: 'Chairs, desks, doors, and windows' },
  { id: 'cat-2', name: 'Computers & Devices', defaultTeam: 'IT Support', description: 'Computers, printers, and peripherals' },
  { id: 'cat-3', name: 'Projectors & AV', defaultTeam: 'IT Support', description: 'Projectors, speakers, and displays' },
  { id: 'cat-4', name: 'Electrical & Lighting', defaultTeam: 'Maintenance', description: 'Lights, outlets, and wiring' },
  { id: 'cat-5', name: 'Plumbing', defaultTeam: 'Maintenance', description: 'Faucets, pipes, and restrooms' },
  { id: 'cat-6', name: 'Network & Internet', defaultTeam: 'IT Support', description: 'Wi-Fi, switches, and connectivity' },
];

export const USERS = [
  { id: 'u1', name: 'Maria Santos', email: 'maria.santos@school.demo', role: 'student', active: true },
  { id: 'u2', name: 'Daniel Reyes', email: 'daniel.reyes@school.demo', role: 'teacher', active: true },
  { id: 'u3', name: 'Alex Cruz', email: 'alex.cruz@school.demo', role: 'it_support', active: true },
  { id: 'u4', name: 'Joel Ramos', email: 'joel.ramos@school.demo', role: 'maintenance', active: true },
  { id: 'u5', name: 'Elena Garcia', email: 'elena.garcia@school.demo', role: 'admin', active: true },
  { id: 'u6', name: 'Paolo Lim', email: 'paolo.lim@school.demo', role: 'student', active: true },
  { id: 'u7', name: 'Rina Dela Cruz', email: 'rina.delacruz@school.demo', role: 'teacher', active: true },
  { id: 'u8', name: 'Kim Torres', email: 'kim.torres@school.demo', role: 'maintenance', active: false },
];

export const TEAMS = [
  { id: 'team-1', name: 'IT Support', leadId: 'u3', members: 4, handles: 'Computers, AV equipment, and network problems' },
  { id: 'team-2', name: 'Maintenance', leadId: 'u4', members: 6, handles: 'Furniture, electrical, and plumbing problems' },
];

// Builds an issue plus a progress timeline that matches its status.
const HOUR = 3600000;
const ORDER = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const OFFSETS = [0, 2, 26, 50, 74];
const add = (iso, hours) => new Date(new Date(iso).getTime() + hours * HOUR).toISOString();

function mk({ id, title, description, category, building, room, status, priority, reporter, created, team = null, assignee = null, resolution = null, notes = [] }) {
  const level = ORDER.indexOf(status);
  const timeline = [];
  for (let i = 0; i <= level; i += 1) {
    const author = i === 0 ? reporter[1] : i === 1 ? 'Elena Garcia' : assignee ? assignee[1] : 'Elena Garcia';
    const text = i === 0 ? 'Report submitted' : i === 1 ? `Assigned to ${team}` : `Status changed to ${ORDER[i]}`;
    timeline.push({ id: `${id}-t${i}`, status: ORDER[i], author, date: add(created, OFFSETS[i]), text });
  }
  return {
    id, title, description, category, building, room, status, priority,
    reportedById: reporter[0],
    reportedByName: reporter[1],
    createdAt: created,
    updatedAt: timeline[timeline.length - 1].date,
    assignedTeam: team,
    assignedToId: assignee ? assignee[0] : null,
    assignedToName: assignee ? assignee[1] : null,
    resolution,
    notes: notes.map((text, i) => ({
      id: `${id}-n${i}`,
      author: assignee ? assignee[1] : 'Staff',
      text,
      date: add(created, OFFSETS[2] + i),
    })),
    timeline,
  };
}

const MARIA = ['u1', 'Maria Santos'];
const DANIEL = ['u2', 'Daniel Reyes'];
const ALEX = ['u3', 'Alex Cruz'];
const JOEL = ['u4', 'Joel Ramos'];

export const ISSUES = [
  mk({ id: 'SF-1001', title: 'Broken classroom chair', description: 'The back support of a chair in Room 204 has snapped and the chair is unsafe to sit on.', category: 'Furniture', building: 'Building A', room: '204', status: 'Assigned', priority: 'Low', reporter: MARIA, created: '2026-10-26T08:30:00.000Z', team: 'Maintenance', assignee: JOEL }),
  mk({ id: 'SF-1002', title: 'Computer will not start', description: 'Computer station 14 shows a black screen and does not respond when the power button is pressed.', category: 'Computers & Devices', building: 'Computer Lab', room: '301', status: 'In Progress', priority: 'High', reporter: DANIEL, created: '2026-10-24T07:45:00.000Z', team: 'IT Support', assignee: ALEX, notes: ['Checked the power cable and outlet. Testing the power supply next.'] }),
  mk({ id: 'SF-1003', title: 'Projector not displaying', description: 'The ceiling projector turns on but shows "No Signal" even with the HDMI cable connected.', category: 'Projectors & AV', building: 'Building B', room: '112', status: 'Submitted', priority: 'Medium', reporter: DANIEL, created: '2026-10-28T13:10:00.000Z' }),
  mk({ id: 'SF-1004', title: 'Faulty classroom light', description: 'Two fluorescent tubes flicker constantly and make it hard to read the board.', category: 'Electrical & Lighting', building: 'Building A', room: '108', status: 'In Progress', priority: 'High', reporter: MARIA, created: '2026-10-23T09:00:00.000Z', team: 'Maintenance', assignee: JOEL, notes: ['Replacement tubes ordered. Scheduled for installation tomorrow.'] }),
  mk({ id: 'SF-1005', title: 'Laboratory internet problem', description: 'No network connection at the front lab benches. Wired and Wi-Fi both fail.', category: 'Network & Internet', building: 'Science Lab', room: '210', status: 'Resolved', priority: 'High', reporter: DANIEL, created: '2026-10-19T10:20:00.000Z', team: 'IT Support', assignee: ALEX, resolution: 'Replaced a faulty network switch port and verified connectivity at every bench.', notes: ['Found a dead switch port in the lab cabinet.'] }),
  mk({ id: 'SF-1006', title: 'Leaking restroom faucet', description: 'The second faucet from the left drips constantly and the floor is wet.', category: 'Plumbing', building: 'Building C', room: 'Restroom 2F', status: 'Assigned', priority: 'Medium', reporter: MARIA, created: '2026-10-27T06:55:00.000Z', team: 'Maintenance', assignee: JOEL }),
  mk({ id: 'SF-1007', title: 'Printer keeps jamming', description: 'The faculty room printer jams on every second page.', category: 'Computers & Devices', building: 'Faculty Room', room: '105', status: 'Closed', priority: 'Low', reporter: DANIEL, created: '2026-10-12T11:30:00.000Z', team: 'IT Support', assignee: ALEX, resolution: 'Cleaned the paper feed rollers and replaced the pickup roller.', notes: ['Rollers worn out. Replacement part installed.'] }),
  mk({ id: 'SF-1008', title: 'Wi-Fi drops in the library', description: 'Wi-Fi disconnects every few minutes in the reading area on the second floor.', category: 'Network & Internet', building: 'Library', room: '100', status: 'Submitted', priority: 'High', reporter: MARIA, created: '2026-10-28T15:40:00.000Z' }),
  mk({ id: 'SF-1009', title: 'Window latch will not lock', description: 'The window latch is bent and the window cannot be locked.', category: 'Furniture', building: 'Building B', room: '205', status: 'Resolved', priority: 'Low', reporter: MARIA, created: '2026-10-17T08:05:00.000Z', team: 'Maintenance', assignee: JOEL, resolution: 'Replaced the latch and tested locking from inside and outside.', notes: ['Latch replaced during the afternoon break.'] }),
  mk({ id: 'SF-1010', title: 'Exposed wiring near outlet', description: 'A wall outlet cover is missing and wires are visible near the stage.', category: 'Electrical & Lighting', building: 'Gymnasium', room: 'Gym Hall', status: 'Assigned', priority: 'Critical', reporter: DANIEL, created: '2026-10-28T07:15:00.000Z', team: 'Maintenance', assignee: JOEL }),
  mk({ id: 'SF-1011', title: 'Keyboard keys missing', description: 'Several keys are missing on keyboards at stations 5 and 6.', category: 'Computers & Devices', building: 'Computer Lab', room: '302', status: 'Submitted', priority: 'Low', reporter: MARIA, created: '2026-10-29T01:20:00.000Z' }),
  mk({ id: 'SF-1012', title: 'Auditorium speaker has no sound', description: 'The left speaker produces no sound during presentations.', category: 'Projectors & AV', building: 'Auditorium', room: 'Main Hall', status: 'In Progress', priority: 'Medium', reporter: DANIEL, created: '2026-10-25T14:00:00.000Z', team: 'IT Support', assignee: ALEX, notes: ['Cable tested OK. Checking the amplifier output.'] }),
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'Report assigned', message: 'SF-1001 was assigned to the Maintenance team.', createdAt: '2026-10-26T10:30:00.000Z', read: false, roles: ['student', 'maintenance', 'admin'], issueId: 'SF-1001' },
  { id: 'n2', title: 'Work started', message: 'SF-1002 is now In Progress.', createdAt: '2026-10-25T09:45:00.000Z', read: false, roles: ['teacher', 'it_support', 'admin'], issueId: 'SF-1002' },
  { id: 'n3', title: 'New report needs assignment', message: 'SF-1008 (Wi-Fi drops in the library) has not been assigned yet.', createdAt: '2026-10-28T15:41:00.000Z', read: false, roles: ['admin'], issueId: 'SF-1008' },
  { id: 'n4', title: 'Issue resolved', message: 'SF-1005 was marked Resolved by IT Support.', createdAt: '2026-10-21T10:20:00.000Z', read: true, roles: ['teacher', 'admin'], issueId: 'SF-1005' },
  { id: 'n5', title: 'Critical issue flagged', message: 'SF-1010 (exposed wiring) is marked Critical.', createdAt: '2026-10-28T09:15:00.000Z', read: false, roles: ['maintenance', 'admin'], issueId: 'SF-1010' },
  { id: 'n6', title: 'Issue closed', message: 'SF-1007 was closed after the printer repair.', createdAt: '2026-10-15T12:30:00.000Z', read: true, roles: ['teacher', 'it_support'], issueId: 'SF-1007' },
  { id: 'n7', title: 'Report received', message: 'Your report SF-1011 was received and is waiting for review.', createdAt: '2026-10-29T01:21:00.000Z', read: false, roles: ['student'], issueId: 'SF-1011' },
  { id: 'n8', title: 'Welcome to SchoolFix AI', message: 'This is a demo notification. Mark it as read to try the feature.', createdAt: '2026-10-20T08:00:00.000Z', read: false, roles: ['student', 'teacher', 'it_support', 'maintenance', 'admin'], issueId: null },
];
