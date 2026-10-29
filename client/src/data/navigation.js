import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  ClipboardList,
  ListChecks,
  Users,
  Tags,
  UsersRound,
  BarChart3,
  Settings,
} from 'lucide-react';

const reporterNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'Report an Issue', icon: PlusCircle },
  { to: '/my-reports', label: 'My Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

const staffNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assigned', label: 'Assigned Issues', icon: ClipboardList },
  { to: '/issues', label: 'All Authorized Issues', icon: ListChecks },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/issues', label: 'All Issues', icon: ListChecks },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/teams', label: 'Teams', icon: UsersRound },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const NAV_BY_ROLE = {
  student: reporterNav,
  teacher: reporterNav,
  it_support: staffNav,
  maintenance: staffNav,
  admin: adminNav,
};
