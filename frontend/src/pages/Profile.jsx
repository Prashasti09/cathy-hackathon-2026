// Owner: Prashasti (Prashasti09) - frontend UI
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="settings">
      <div className="toolbar"><h1>My profile</h1></div>
      <div className="sheet narrow profile">
        <span className="avatar big">{user.loginId[0].toUpperCase()}</span>
        <dl>
          <dt>Login ID</dt><dd>{user.loginId}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
        </dl>
        <button type="button" className="btn-ghost" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
      </div>
    </div>
  );
}
