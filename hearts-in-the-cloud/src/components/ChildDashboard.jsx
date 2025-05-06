import React, { useEffect, useState } from 'react';
import styles from './ChildDashboard.module.css';
import { supabase } from '../supabase';

export default function ChildDashboard() {
  const [dailyNote, setDailyNote] = useState('');
  const [photoWall, setPhotoWall] = useState([]);
  const [messages, setMessages] = useState([]);
  const [vaultItems, setVaultItems] = useState([]);
  const [countdown, setCountdown] = useState('');
  const [releaseDate, setReleaseDate] = useState(null);

  const [childName, setChildName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [editingProfile, setEditingProfile] = useState(false);
    const [newName, setNewName] = useState('');
    const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchDailyNote();
    fetchPhotoWall();
    fetchMessages();
    fetchVaultItems();
    calculateCountdown();
    
  }, []);

  const fetchDailyNote = async () => {
    const { data, error } = await supabase.from('daily_notes').select('note').single();
    if (!error && data) setDailyNote(data.note);
  };

  const fetchPhotoWall = async () => {
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    setPhotoWall(data || []);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
  };

  const fetchVaultItems = async () => {
    const { data } = await supabase.from('vault_items').select('*');
    setVaultItems(data || []);
  };

  const calculateCountdown = () => {
    // This assumes a stored return date — adjust as needed
    const returnDate = new Date('2025-11-01');
    const now = new Date();
    const diffTime = returnDate - now;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setCountdown(`${days} days until return`);
  };

  return (
    <div className={styles.container}>
      <h1>Welcome!</h1>

      <section className={styles.section}>
        <h2>Countdown</h2>
        <p>{countdown}</p>
      </section>

      <section className={styles.section}>
        <h2>Daily Note</h2>
        <p>{dailyNote || 'No note today.'}</p>
      </section>

      <section className={styles.section}>
        <h2>Messages</h2>
        {messages.length > 0 ? (
          messages.map((msg, i) => (
            <div key={i} className={styles.message}>
              <p>{msg.text}</p>
              {msg.audio_url && <audio controls src={msg.audio_url}></audio>}
              {msg.video_url && <video controls src={msg.video_url} width="100%" />}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2>Vault</h2>
        {vaultItems.length > 0 ? (
          vaultItems.map((item, i) => (
            <div key={i} className={styles.vaultItem}>
              <p><strong>Hint:</strong> {item.title}</p>
              <p>Enter Code to Unlock: (feature coming soon)</p>
            </div>
          ))
        ) : (
          <p>No vault items yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2>Photo Wall</h2>
        <div className={styles.photoGrid}>
          {photoWall.map((photo, i) => (
            <img key={i} src={photo.image_url} alt="memory" />
          ))}
        </div>
      </section>
    </div>
  );
}