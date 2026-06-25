import { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="me-row">
          <div className="avatar avatar-me">{getInitials(user?.username)}</div>
          <div>
            <p className="me-name">{user?.username}</p>
            <p className="me-status">Active now</p>
          </div>
        </div>
        <button className="icon-btn" onClick={logout} title="Log out">
          ⏻
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search people"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="user-list">
        {filteredUsers.length === 0 && (
          <p className="empty-hint">No one else has joined yet.</p>
        )}
        {filteredUsers.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          const isSelected = selectedUser?._id === u._id;
          return (
            <button
              key={u._id}
              className={`user-item ${isSelected ? 'user-item-active' : ''}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar-wrap">
                <div className="avatar">{getInitials(u.username)}</div>
                {isOnline && <span className="online-dot" />}
              </div>
              <div className="user-meta">
                <p className="user-name">{u.username}</p>
                <p className="user-sub">{isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
