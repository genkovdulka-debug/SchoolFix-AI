import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_ROLE, ROLES } from '../data/roles.js';

const ROLE_KEY = 'schoolfix_demo_role';
const SESSION_KEY = 'schoolfix_demo_session';
const PROFILE_KEY = 'schoolfix_demo_profiles';

const RoleContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

// DEMO ONLY: role and "session" live in the browser, so they are not secure.
export function RoleProvider({ children }) {
  const [roleId, setRoleId] = useState(() => {
    const stored = load(ROLE_KEY, DEFAULT_ROLE);
    return ROLES[stored] ? stored : DEFAULT_ROLE;
  });
  const [loggedIn, setLoggedIn] = useState(() => load(SESSION_KEY, false) === true);
  const [profiles, setProfiles] = useState(() => load(PROFILE_KEY, {}));

  const setRole = useCallback((id) => {
    if (!ROLES[id]) return;
    setRoleId(id);
    save(ROLE_KEY, id);
  }, []);

  const login = useCallback((id) => {
    if (ROLES[id]) {
      setRoleId(id);
      save(ROLE_KEY, id);
    }
    setLoggedIn(true);
    save(SESSION_KEY, true);
  }, []);

  const logout = useCallback(() => {
    setLoggedIn(false);
    save(SESSION_KEY, false);
  }, []);

  const updateProfile = useCallback(
    (fields) => {
      setProfiles((prev) => {
        const next = { ...prev, [roleId]: { ...(prev[roleId] || {}), ...fields } };
        save(PROFILE_KEY, next);
        return next;
      });
    },
    [roleId]
  );

  const value = useMemo(
    () => ({
      roleId,
      role: ROLES[roleId],
      user: { ...ROLES[roleId].user, ...(profiles[roleId] || {}) },
      loggedIn,
      setRole,
      login,
      logout,
      updateProfile,
    }),
    [roleId, loggedIn, profiles, setRole, login, logout, updateProfile]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
}
