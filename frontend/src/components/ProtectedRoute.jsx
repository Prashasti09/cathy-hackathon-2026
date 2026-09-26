// Owner: Prashasti (Prashasti09) - frontend UI
// Shows the page only when logged in; otherwise sends you to the login page.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app">
      <Navbar />
      <main className="page">{children}</main>
    </div>
  );
}
