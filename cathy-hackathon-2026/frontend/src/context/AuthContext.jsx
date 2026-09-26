// Owner: Anmol (code-by-anmol) - logic & integration
// Remembers who is logged in (saved in the browser so a page refresh keeps you logged in).
import { createContext, useContext, useState } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('ss_user'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  function save({ token, user: u }) {
    localStorage.setItem('ss_token', token);
    localStorage.setItem('ss_user', JSON.stringify(u));
    setUser(u);
  }

  const login = async (loginId, password) => save(await authApi.login(loginId, password));
  const signup = async (loginId, email, password) => save(await authApi.signup(loginId, email, password));

  function logout() {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
