import React, { useState } from 'react';

const CATEGORIES = ['Animals', 'Movies', 'Food', 'Sports'];
const ROUND_OPTIONS = [3, 5, 8];

export default function Home({ onCreateRoom, onJoinRoom, error }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || '').toUpperCase();
  });
  const [category, setCategory] = useState('Animals');
  const [maxRounds, setMaxRounds] = useState(3);
  const [mode, setMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') ? 'join' : 'choice';
  });

  const handleCreate = (e) => {
    e.preventDefault();
    onCreateRoom({ name: name.trim(), category, maxRounds });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    onJoinRoom({ name: name.trim(), roomCode: roomCode.trim().toUpperCase() });
  };

  return (
    <div className="glass-panel lobby-container">
      {/* Header */}
      <h1 style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
        ScribbleShowdown
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Draw, guess, and compete with friends in real time!
      </p>

      {/* Error Display */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Choice Mode */}
      {mode === 'choice' && (
        <div>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={15}
            placeholder="e.g. DrawMaster99"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', marginBottom: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              className="btn-primary"
              disabled={!name.trim()}
              onClick={() => setMode('create')}
            >
              Host a Game
            </button>
            <button
              className="btn-secondary"
              disabled={!name.trim()}
              onClick={() => setMode('join')}
            >
              Join a Game
            </button>
          </div>
        </div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rounds</label>
            <select
              value={maxRounds}
              onChange={(e) => setMaxRounds(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box' }}
            >
              {ROUND_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary">Create Room</button>
            <button type="button" className="btn-secondary" onClick={() => setMode('choice')}>Back</button>
          </div>
        </form>
      )}

      {/* Join Mode */}
      {mode === 'join' && (
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABCDEF"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={!roomCode.trim()}>Join Room</button>
            <button type="button" className="btn-secondary" onClick={() => setMode('choice')}>Back</button>
          </div>
        </form>
      )}
    </div>
  );
}
