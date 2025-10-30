import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './Pages.css';

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [editing, setEditing] = useState(false);

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <h1>My Profile</h1>
          <div className="card" style={{ padding: '30px', maxWidth: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                margin: '0 auto 15px'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: '0 0 5px 0' }}>{user?.name}</h2>
              <p style={{ color: '#666', margin: 0 }}>{user?.email}</p>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled={!editing}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Member Since</label>
              <input
                type="text"
                value={new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                disabled
                className="form-control"
              />
            </div>

            <button 
              className="btn-primary" 
              onClick={() => setEditing(!editing)}
              style={{ width: '100%' }}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
