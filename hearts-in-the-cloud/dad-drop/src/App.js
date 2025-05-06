import React, { useState, useEffect } from 'react';
import DailyNotes from './components/DailyNotes';
import MysteryBox from './components/MysteryBox';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { supabase } from './supabase';
import './App.css';

import ChildView from './components/ChildView'; // 👈 we'll create this
import { HashRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');



  const parentId = '65e2dc7a-9db5-48bf-b4b2-96adaee257f4'; // optional if you're not using it directly

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      setUserId(user.id);
  
      if (user.id === parentId) {
        setActiveTab('admin');
      }
    };
  
    checkUser();
  }, []);
  

  if (!userId) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };




  return (
    
    
    <Routes>
    {/* 👧 Dedicated child route */}
    <Route path="/child" element={<ChildView />} />
  
    {/* 👨‍👧 Main parent route (with login + tabs) */}
    <Route
      path="/"
      element={
        !userId ? (
          <Login onLogin={() => window.location.reload()} />
        ) : (
          <div className="app-container">
            <h1 className="app-title">💖 DadDrop</h1>
  
            <div className="tab-buttons">
              <button
                className={activeTab === 'notes' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('notes')}
              >
                Daily Notes
              </button>
              <button
                className={activeTab === 'mystery' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('mystery')}
              >
                Mystery Box
              </button>
              {userId === parentId && (
                <button
                  className={activeTab === 'admin' ? 'tab active' : 'tab'}
                  onClick={() => setActiveTab('admin')}
                >
                  Admin
                </button>
              )}
            </div>
  
            <div className="tab-content">
              {activeTab === 'notes' && <DailyNotes />}
              {activeTab === 'mystery' && <MysteryBox />}
              {activeTab === 'admin' && <AdminDashboard />}
            </div>
  
            <button
              onClick={handleLogout}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        )
      }
    />
  </Routes>
      
    );
  
}

export default App;
