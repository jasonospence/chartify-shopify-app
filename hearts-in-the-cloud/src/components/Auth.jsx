import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import styles from './Auth.module.css';
import { supabase } from '../supabase';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('child');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const user = data.user || data.session?.user;
        if (user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: user.id,
              full_name: fullName,
              role,
              family_code: email.split('@')[0],
            },
          ]);
          if (profileError) throw profileError;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const user = data.user;
        if (!user) throw new Error('User not found');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.role === 'child') {
          navigate('/child-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Hearts in the Cloud Logo" />
      </div>

      <h2 className={styles.title}>{isSignUp ? 'Create Account' : 'Login'}</h2>

      <form onSubmit={handleAuth}>
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>

        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
      </form>

      <div className={styles.switch}>
        <button
          className={styles.toggleButton}
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Back to Login' : 'Create an Account'}
        </button>
      </div>
    </div>
  );
}