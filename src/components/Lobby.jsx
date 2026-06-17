import React, { useState } from 'react';

export default function Lobby({ roomState, socketId, onStartGame }) {
  const { code, players, category, maxRounds } = roomState;
  const [copied, setCopied] = useState(false);

  const isHost = players.length > 0 && players[0].id === socketId;

  const copyRoomLink = async () => {
    const url = `${window.location.origin}?room=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="glass-panel lobby-container">
      {/* Header */}
      <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Waiting Lobby</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Share the room code or link to invite friends
      </p>

      {/* Info Card */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '0.25em' }}>
            {code}
          </span>
        </div>

        <button
          className="btn-secondary"
          onClick={copyRoomLink}
          style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.9rem' }}
        >
          {copied ? 'Copied Link! ✅' : '📋 Copy Invite Link'}
        </button>

        {/* Separator */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{category}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Rounds</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{maxRounds}</div>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
          Players ({players.length}/8)
        </h3>

        {players.length < 2 && (
          <p style={{ color: 'var(--accent-yellow, #fbbf24)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
            ⚠️ At least 2 players are needed to start
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {players.map((player) => {
            const isSelf = player.id === socketId;
            const isPlayerHost = players[0].id === player.id;

            return (
              <div
                key={player.id}
                className="player-card"
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', background: 'var(--bg-secondary)', border: isSelf ? '1px solid var(--accent-purple)' : '1px solid transparent' }}
              >
                {/* Green dot */}
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />

                <span style={{ fontWeight: isSelf ? 700 : 400, color: 'var(--text-primary)', flex: 1 }}>
                  {player.name}{isSelf && ' (You)'}
                </span>

                {isPlayerHost && (
                  <span className="host-badge" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', fontWeight: 600 }}>
                    Host
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      {isHost ? (
        <button
          className="btn-primary"
          onClick={onStartGame}
          disabled={players.length < 2}
          style={{ width: '100%' }}
        >
          Start Game
        </button>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          🕐 Waiting for the host to start the game…
        </p>
      )}
    </div>
  );
}
