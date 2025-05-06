import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';

export default function Dashboard() {
// video thumbnail//
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // profile photo //
  const [profileImage, setProfileImage] = useState('/profile.jpg');
  const [profileUpload, setProfileUpload] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  //photo wall//
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');

  //Edit sections//
  const [editingDate, setEditingDate] = useState(false);
  const [newReturnDate, setNewReturnDate] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [vaultTitle, setVaultTitle] = useState('Mystery Vault');
  const [editingVaultTitle, setEditingVaultTitle] = useState(false);
  const [vaultInput, setVaultInput] = useState('');

  //Mystery Vault//
  const [vaultItems, setVaultItems] = useState([]);
  const [vaultTitleInput, setVaultTitleInput] = useState('');
  const [vaultMessageInput, setVaultMessageInput] = useState('');
  const [vaultReleaseDate, setVaultReleaseDate] = useState('');
  const [vaultCode, setVaultCode] = useState('');
  const [vaultVisible, setVaultVisible] = useState(true);
  const [vaultFile, setVaultFile] = useState(null);
  const [vaultUploadSuccess, setVaultUploadSuccess] = useState(false);
  
  // Canvas //
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasRef, setCanvasRef] = useState(null);
  


  

  const uploadToCloudinary = async (file) => {
    const cloudName = 'dr2ovgbuc'; // replace with your cloud name
    const unsignedPreset = 'hitc_app'; // replace with your upload preset
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', unsignedPreset);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      return null;
    }
    await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );

  };


  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [note, setNote] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isParent, setIsParent] = useState(false);
  const [messages, setMessages] = useState([]);
    // for message section//
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newMessageType, setNewMessageType] = useState('video');
  const [file, setFile] = useState(null);
  // textupload success//
  const [successMsg, setSuccessMsg] = useState('');
  // new message//
  const [newMessageIds, setNewMessageIds] = useState([]);

  //mystery vault//
  const handleVaultUpload = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
  
    const mediaUrl = await uploadToCloudinary(vaultFile);
    if (!mediaUrl) {
      alert("Upload failed");
      return;
    }
  
    const vaultItem = {
      user_id: user.id,
      title: vaultTitleInput,
      message: vaultMessageInput,
      media_url: mediaUrl,
      release_date: vaultReleaseDate || null,
      visible_to_child: vaultVisible,
      family_code: vaultCode,
    };
  
    console.log("Submitting vault item:", vaultItem); // <-- Add this line
  
    const { error } = await supabase.from('vault_items').insert([vaultItem]);
  
    if (error) {
      console.error("Vault insert error:", error.message); // Optional extra log
      alert("Failed to save vault item");
    } else {
      setVaultUploadSuccess(true);
      setTimeout(() => setVaultUploadSuccess(false), 3000);
      setVaultTitleInput('');
      setVaultMessageInput('');
      setVaultReleaseDate('');
      setVaultCode('');
      setVaultFile(null);
      setVaultVisible(true);
    }
  };
  
// mystery vault //

const fetchVaultItems = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('vault_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch vault items:', error.message);
  } else {
    setVaultItems(data);
  }
};


//VAULTVAULTVAULTVAULTVAULT-------------------///




//sdfghrstdfhjgdjjdhhj//ghfdghjgh-----//////

useEffect(() => {
  const seenMessageIds = localStorage.getItem('seenMessageIds');
  const parsedSeenIds = seenMessageIds ? JSON.parse(seenMessageIds) : [];

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, type, title, status, created_at, media_url')
      .order('created_at', { ascending: false });

    if (data) {
      setMessages(data);
      const allIds = data.map((msg) => msg.id);
      const newIds = allIds.filter((id) => !parsedSeenIds.includes(id));
      setNewMessageIds(newIds);
      localStorage.setItem('seenMessageIds', JSON.stringify(allIds));
    }

    if (error) console.error('Messages error:', error.message);
  };

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vaultData } = await supabase
      .from('vault_settings')
      .select('title')
      .eq('user_id', user.id)
      .single();

    if (vaultData?.title) setVaultTitle(vaultData.title);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, return_date, role, profile_image')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile load error:', profileError.message);
    } else {
      setFullName(profile.full_name);
      setIsParent(profile.role === 'parent');
      setProfileImage(profile.profile_image || '/profile.jpg');

      if (profile.return_date) {
        const diffTime = new Date(profile.return_date) - new Date();
        setDaysLeft(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }

    const { data: noteData } = await supabase
      .from('daily_notes')
      .select('message')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (noteData) setNote(noteData.message);

    // === CALL THIS TO LOAD VAULT ITEMS ===
    await fetchVaultItems();
  };

  fetchMessages();
  fetchData();
}, []);



  useEffect(() => {
    // Load previously seen messages from localStorage
    const seenMessageIds = localStorage.getItem('seenMessageIds');
    const parsedSeenIds = seenMessageIds ? JSON.parse(seenMessageIds) : [];
    
   
  
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, type, title, status, created_at, media_url')
        .order('created_at', { ascending: false });
  
      if (data) {
        setMessages(data);
  
        // Store new message IDs (those not in localStorage yet)
        const allIds = data.map((msg) => msg.id);
        const newIds = allIds.filter((id) => !parsedSeenIds.includes(id));
        setNewMessageIds(newIds);
  
        // Save current messages to localStorage (for next visit)
        localStorage.setItem('seenMessageIds', JSON.stringify(allIds));
      }
  
      if (error) console.error('Messages error:', error.message);
    };
  
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vaultData } = await supabase
  .from('vault_settings')
  .select('title')
  .eq('user_id', user.id)
  .single();

if (vaultData?.title) setVaultTitle(vaultData.title);
  
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, return_date, role, profile_image')
        .eq('id', user.id)
        .single();
  
      if (profileError) {
        console.error('Profile load error:', profileError.message);
      } else {
        setFullName(profile.full_name);
        setIsParent(profile.role === 'parent');
        setProfileImage(profile.profile_image || '/profile.jpg'); // fallback to default
  
        if (profile.return_date) {
          const diffTime = new Date(profile.return_date) - new Date();
          setDaysLeft(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
      }
  
      const { data: noteData } = await supabase
        .from('daily_notes')
        .select('message')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
  
      if (noteData) setNote(noteData.message);
      
    };

    
  
    fetchMessages();
    fetchData();
  }, []);

  {/* vault */}

  const saveVaultTitle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
  
    const { error } = await supabase
      .from('vault_settings')
      .update({ title: vaultInput })
      .eq('user_id', user.id);
  
    if (!error) {
      setVaultTitle(vaultInput);
      setEditingVaultTitle(false);
      setVaultInput('');
    } else {
      alert('Failed to update vault title');
      console.error('Vault update error:', error.message);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const postNewNote = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('daily_notes').insert([{ message: noteInput, user_id: user.id }]);
  
    if (error) alert('Error posting note: ' + error.message);
    else {
      setNote(noteInput);
      setNoteInput('');
    }
  };
  
  const postNewMessage = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
  
    let mediaUrl = '';
  
    // Upload to Cloudinary if a file is provided
    if (file) {
      mediaUrl = await uploadToCloudinary(file);
      if (!mediaUrl) {
        alert('Failed to upload media to Cloudinary.');
        return;
      }
    }
  
    // Insert new message into Supabase
    const { data: inserted, error } = await supabase
      .from('messages')
      .insert([{
        title: newMessageTitle,
        type: newMessageType,
        status: 'Sent',
        user_id: user.id,
        media_url: mediaUrl
      }])
      .select();
  
    if (error) {
      alert('Error posting message: ' + error.message);
    } else {
      // Mark message as new
      if (inserted && inserted[0]?.id) {
        setNewMessageIds((prev) => [...prev, inserted[0].id]);
      }
  
      setSuccessMsg('Message posted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
  
      setNewMessageTitle('');
      setNewMessageType('video');
      setFile(null);
    }

    {successMsg && (
      <div style={{
        background: '#d4edda',
        color: '#155724',
        padding: '10px 20px',
        borderRadius: '6px',
        marginBottom: '15px',
        border: '1px solid #c3e6cb',
        textAlign: 'center',
        fontWeight: 'bold',
      }}>
        {successMsg}
      </div>
    )}
  };
  
  const handleDeleteMessage = async (msg) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${msg.title}"?`);
    if (!confirmDelete) return;
  
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', msg.id);
  
    if (error) {
      alert('Failed to delete message: ' + error.message);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    }
  };

// daily notes//
const handleLike = async (photoId) => {
  const { error } = await supabase.rpc('increment_likes', { photo_id: photoId });

  if (!error) {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, likes: p.likes + 1 } : p
      )
    );
  } else {
    console.error('Like failed:', error.message);
  }
};

// photo wall//
const [photos, setPhotos] = useState([]);
const [photoUpload, setPhotoUpload] = useState(null);

useEffect(() => {
  fetchPhotos(); // Add this to your main useEffect if not already there
}, []);

const fetchPhotos = async () => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setPhotos(data);
  } catch (err) {
    console.error('Photo fetch error:', err.message);
    console.log('Fetched photos:', data);
  }
};

const handleUploadPhoto = async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();

  if (!photoUpload) return;

  const imageUrl = await uploadToCloudinary(photoUpload);
  if (!imageUrl) {
    setPhotoSuccess(false);
    return;
  }

  const { error } = await supabase.from('photos').insert([
    { user_id: user.id, image_url: imageUrl, likes: 0, caption: photoCaption }
  ]);
  if (error) {
    console.error('Error saving photo:', error.message);
    setPhotoSuccess(false);
    return;
  }

  setPhotoUpload(null);
  setPhotoSuccess(true);
  setPhotoCaption('');
  fetchPhotos();

  setTimeout(() => setPhotoSuccess(false), 3000);
};

const handleProfileUpload = async (e) => {
  e.preventDefault();

  if (!profileUpload) return;

  const imageUrl = await uploadToCloudinary(profileUpload); // Make sure this function is working
  if (!imageUrl) {
    alert('Upload failed');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('profiles')
    .update({ profile_image: imageUrl })
    .eq('id', user.id);

  if (error) {
    alert('Error saving profile photo: ' + error.message);
    return;
  }

  setProfileImage(imageUrl);
  setProfileUpload(null);
  setShowProfileEdit(false);
  alert('Profile photo updated!');

{/*------------------------Canvas--------------------*/}

const startDrawing = (ctx, e) => {
  ctx.beginPath();
  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  canvasRef.isDrawing = true;
};

const draw = (ctx, e) => {
  if (!canvasRef.isDrawing) return;
  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  ctx.stroke();
};

const stopDrawing = (ctx) => {
  ctx.closePath();
  canvasRef.isDrawing = false;
};


};


  return (
    <div className={styles.container}>
  {/* Header — spans full width */}
  {/*success message container*/}
  {successMsg && (
  <div
    style={{
      background: '#d4edda',
      color: '#155724',
      padding: '10px 20px',
      borderRadius: '6px',
      marginBottom: '15px',
      border: '1px solid #c3e6cb',
      textAlign: 'center',
      fontWeight: 'bold',
    }}
  >
    {successMsg}
  </div>
)}

{/* THIS IS FOR VIDEO POPUP*/}
{showVideoModal && selectedVideo && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      position: 'relative',
      background: '#fff',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '90%',
      maxHeight: '90%'
    }}>
      <button
        onClick={() => setShowVideoModal(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#e91e63',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer'
        }}
      >
        X
      </button>
      <video controls style={{ width: '100%', borderRadius: '8px' }}>
        <source src={selectedVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
)}
{/*----------------HEADER----------------------------*/}
  <header className={styles.header}>
  <h1>
  Welcome back, {editingName ? (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: newDisplayName })
          .eq('id', user.id);

        if (!error) {
          setFullName(newDisplayName);
          setEditingName(false);
        } else {
          alert('Name update failed');
        }
      }}
      style={{ display: 'inline-block', marginLeft: '10px' }}
    >
      <input
        type="text"
        value={newDisplayName}
        onChange={(e) => setNewDisplayName(e.target.value)}
        style={{
          fontSize: '1rem',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginRight: '6px',
        }}
      />
      <button
        type="submit"
        style={{
          background: '#007AFF',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditingName(false)}
        style={{
          background: '#ccc',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          marginLeft: '4px',
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>
    </form>
  ) : (
    <>
      {fullName || 'Friend'}
      {isParent && (
        <span
          onClick={() => setEditingName(true)}
          style={{
            fontSize: '0.8rem',
            color: '#007AFF',
            marginLeft: '12px',
            cursor: 'pointer'
          }}
        >
          Edit
        </span>
      )}
    </>
  )}
</h1>
    {/*profile image*/}
    <div style={{ textAlign: 'center' }}>
  <img 
    src={profileImage || '/profile.jpg'} 
    alt="Profile" 
    style={{ width: '60px', height: '60px', borderRadius: '50%' }} 
  />
  {isParent && !showProfileEdit && (
    <div 
      style={{ fontSize: '0.8rem', color: '#007AFF', cursor: 'pointer', marginTop: '6px' }}
      onClick={() => setShowProfileEdit(true)}
    >
      Edit
    </div>
  )}

  {showProfileEdit && (
    <form onSubmit={handleProfileUpload} style={{ marginTop: '10px' }}>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setProfileUpload(e.target.files[0])} 
        style={{ marginBottom: '6px', width: '100%' }} 
      />
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          type="button"
          onClick={() => setShowProfileEdit(false)}
          style={{
            background: '#ccc',
            color: '#333',
            padding: '6px 10px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          style={{
            background: '#007AFF',
            color: '#fff',
            padding: '6px 10px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Upload
        </button>
      </div>
    </form>
  )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  </header>

  {/* Left Column — wider */}
  <div className={styles.row}>

  <section className={styles.card}>
  <h3>Daily Note</h3>

  {successMsg && (
    <div
      style={{
        background: '#d4edda',
        color: '#155724',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '12px',
        border: '1px solid #c3e6cb',
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      {successMsg}
    </div>
  )}

  {note && !noteInput ? (
    <>
      <p style={{ marginBottom: '12px' }}>{note}</p>
      <button
        onClick={() => setNoteInput(note)}
        style={{
          background: '#007AFF',
          color: '#fff',
          padding: '6px 14px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Edit Note
      </button>
    </>
  ) : (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('daily_notes')
          .insert([{ message: noteInput, user_id: user.id }]);

        if (error) {
          alert('Error saving note: ' + error.message);
        } else {
          setNote(noteInput);
          setNoteInput('');
          setSuccessMsg('Note saved!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }}
    >
      <textarea
        value={noteInput}
        onChange={(e) => setNoteInput(e.target.value)}
        placeholder="Write your note..."
        rows={3}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '10px',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          onClick={() => setNoteInput('')}
          style={{
            background: '#CCC',
            color: '#333',
            padding: '6px 14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            background: '#007AFF',
            color: '#fff',
            padding: '6px 14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Save Note
        </button>
      </div>
    </form>
  )}
</section>


  <section className={styles.card}>
  <h3>Messages</h3>
  {messages.length === 0 ? (
    <p>No messages yet.</p>
  ) : (
    <>
      <div className={styles.scrollableContainer} style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px', maxHeight: '320px',
  
    marginTop: '12px' }}>
        <ul className={styles.messageList}>
        {messages.map((msg, index) => (
            <li
              key={msg.id}
              className={styles.messageItem}
              style={{
                borderLeft: newMessageIds.includes(msg.id) ? '4px solid green' : '4px solid transparent',
                paddingLeft: '12px',
                transition: 'border-color 0.3s ease',
              }}
            >
              <div style={{ position: 'relative' }}>
                <span className={styles.asterisk}></span>
                <strong>{msg.type.toUpperCase()}</strong> - {msg.title}
                <div className={styles.timestamp}>
                  {new Date(msg.created_at).toLocaleString()}
                </div>

                {/* Media preview */}
                {msg.type === 'video' && (
  <div
    onClick={() => window.open(msg.media_url, '_blank')}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'left',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      height: '40px',
      marginTop: '10px',
      cursor: 'pointer'
    }}
  >
    <span style={{ fontSize: '2rem' }}>▶️</span>
  </div>
)}

{msg.media_url && msg.type === 'audio' && (
  <audio
    controls
    style={{ marginTop: '10px', width: '100%' }}
  >
    <source src={msg.media_url} type="audio/mpeg" />
    Your browser does not support the audio tag.
  </audio>
)}

{msg.media_url && msg.type === 'text' && (
  <a
    href={msg.media_url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'block',
      marginTop: '10px',
      color: '#2196f3'
    }}
  >
    View Text Message
  </a>
)}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                    lineHeight: '1',
                  }}
                >
                  Sent
                </span>
                <button onClick={() => handleDeleteMessage(msg)} className="deleteBtn">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      </>

        )}
{/* this is the function*/}
{isParent && (
  <section className={styles.card}>
    <h3>Post a New Message</h3>
    <form onSubmit={postNewMessage}>
      <input
        type="text"
        placeholder="Message title"
        value={newMessageTitle}
        onChange={(e) => setNewMessageTitle(e.target.value)}
        required
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <select
        value={newMessageType}
        onChange={(e) => setNewMessageType(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      >


        <option value="video">Video</option>
        <option value="audio">Audio</option>
        <option value="text">Text</option>
      </select>

      {['video', 'audio'].includes(newMessageType) && (
  <input
    type="file"
    accept={newMessageType === 'video' ? 'video/*' : 'audio/*'}
    onChange={(e) => setFile(e.target.files[0])}
    style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
  />
)}

      <button
        type="submit"
        style={{
          background: '#e91e63',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        Post Message
      </button>
    </form>
  </section>
)}

      </section>

<section className={styles.card}>
  <h3>Canvas</h3>
  <button
    style={{
      background: '#007AFF',
      color: '#fff',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '10px'
    }}
    onClick={() => setShowCanvas(true)}
  >
    Open Canvas
  </button>
</section>

{/* Modal Canvas */}
{showCanvas && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '500px',
      textAlign: 'center'
    }}>
      <h3>Draw Something</h3>
      <canvas
        ref={(ref) => {
          if (ref) {
            const ctx = ref.getContext('2d');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            ref.onmousedown = (e) => startDrawing(ctx, e);
            ref.onmousemove = (e) => draw(ctx, e);
            ref.onmouseup = () => stopDrawing(ctx);
            ref.onmouseleave = () => stopDrawing(ctx);

            setCanvasRef(ref);
          }
        }}
        width="400"
        height="300"
        style={{
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginTop: '10px',
          background: '#fdfdfd'
        }}
      ></canvas>
      <div style={{ marginTop: '10px' }}>
        <button
          style={{
            background: '#e91e63',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            marginRight: '10px'
          }}
          onClick={() => {
            const ctx = canvasRef.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
          }}
        >
          Clear
        </button>
        <button
          onClick={() => setShowCanvas(false)}
          style={{
            background: '#ccc',
            color: '#000',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
  </div>



  {/* Right Column — narrower */}
  <div className={styles.rightColumn}>
    
  <section className={styles.countdownCard}>
  <h1>{daysLeft}</h1>
  <p>
    days until I’m home
    {isParent && !editingDate && (
      <span 
        onClick={() => setEditingDate(true)} 
        style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#007AFF', cursor: 'pointer' }}
      >
        Edit
      </span>
    )}
  </p>

  {editingDate && (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('profiles')
          .update({ return_date: newReturnDate })
          .eq('id', user.id);

        if (!error) {
          const diffTime = new Date(newReturnDate) - new Date();
          setDaysLeft(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          setEditingDate(false);
        } else {
          alert('Failed to update date');
        }
      }}
      style={{ marginTop: '10px' }}
    >
      <input
        type="date"
        value={newReturnDate}
        onChange={(e) => setNewReturnDate(e.target.value)}
        required
        style={{
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '6px',
        }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          style={{
            background: '#007AFF',
            color: '#fff',
            padding: '6px 14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditingDate(false)}
          style={{
            background: '#ccc',
            padding: '6px 14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</section>
{/* photowall section*/}
<section className={styles.card}>
  <h3>Photo Wall</h3>

  {photoSuccess && (
    <div
      style={{
        background: '#d4edda',
        color: '#155724',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '10px',
        border: '1px solid #c3e6cb',
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      Photo uploaded successfully!
    </div>
  )}

  {isParent && (
    <form
      onSubmit={handleUploadPhoto}
      style={{ marginBottom: '10px' }}
    >
      <input
        type="text"
        placeholder="Enter a caption"
        value={photoCaption}
        onChange={(e) => setPhotoCaption(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc'
        }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhotoUpload(e.target.files[0])}
        required
        style={{ marginBottom: '10px', width: '100%' }}
      />
      <button
        type="submit"
        style={{
          background: '#e91e63',
          color: '#fff',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        Upload Photo
      </button>
    </form>
  )}

  <div className={styles.photoGrid}>
    {photos.map((photo) => (
      <div key={photo.id} className={styles.photoCard}>
        <img src={photo.image_url} alt="Uploaded" />
        <div className={styles.photoActions}>
          <button
            onClick={() => handleLikePhoto(photo.id)}
            className={styles.likeButton}
          >
            ❤️ {photo.likes}
          </button>
          {isParent && (
            <button
              onClick={() => handleDeletePhoto(photo.id)}
              className={styles.deleteBtn}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
</section>
{/*--------------------------- MYSTERY VAULT SECTION---------------------*/}
<section className={styles.card}>
  <h3>Mystery Vault</h3>

  {vaultUploadSuccess && (
    <div style={{ background: '#d4edda', padding: '10px', marginBottom: '10px', borderRadius: '6px', fontWeight: 'bold', color: '#155724' }}>
      Mystery item added!
    </div>
  )}

  <form onSubmit={handleVaultUpload}>
    <input
      type="text"
      placeholder="Title (e.g. Birthday Surprise)"
      value={vaultTitleInput}
      onChange={(e) => setVaultTitleInput(e.target.value)}
      required
      style={{ width: '100%', marginBottom: '10px' }}
    />

    <textarea
      placeholder="Message (optional)"
      value={vaultMessageInput}
      onChange={(e) => setVaultMessageInput(e.target.value)}
      rows={3}
      style={{ width: '100%', marginBottom: '10px' }}
    />

    <input
      type="date"
      value={vaultReleaseDate}
      onChange={(e) => setVaultReleaseDate(e.target.value)}
      style={{ marginBottom: '10px', width: '100%' }}
    />

    <input
      type="text"
      placeholder="Unlock code"
      value={vaultCode}
      onChange={(e) => setVaultCode(e.target.value)}
      required
      style={{ width: '100%', marginBottom: '10px' }}
    />

    <input
      type="file"
      onChange={(e) => setVaultFile(e.target.files[0])}
      required
      style={{ width: '100%', marginBottom: '10px' }}
    />

    <label style={{ display: 'block', marginBottom: '10px' }}>
      <input
        type="checkbox"
        checked={vaultVisible}
        onChange={() => setVaultVisible(!vaultVisible)}
      />
      &nbsp; Visible to child
    </label>

    <button
      type="submit"
      style={{ background: '#e91e63', color: 'white', padding: '10px', width: '100%', border: 'none', borderRadius: '6px' }}
    >
      Upload Vault Item
    </button>
  </form>

  {/* Display Vault Items */}
  {vaultItems.length > 0 && (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ marginBottom: '10px' }}>Uploaded Items</h4>
      {vaultItems.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '15px',
            background: '#f9f9f9'
          }}
        >
          <strong>{item.title}</strong>
          <p style={{ marginTop: '5px' }}>{item.message}</p>
          {item.media_url && (
            <img
              src={item.media_url}
              alt="Vault item"
              style={{ width: '100%', marginTop: '10px', borderRadius: '6px' }}
            />
          )}
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
            Release: {item.release_date || 'Not set'} | Code: {item.family_code}
          </p>
        </div>
      ))}
    </div>
  )}
</section>
  </div>
</div>
  );
}