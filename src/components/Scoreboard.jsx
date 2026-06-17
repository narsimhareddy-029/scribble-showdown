import React from 'react';

export default function Scoreboard({ players, currentDrawer }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div style={styles.container}>
      {sorted.map((player, index) => {
        const isDrawing = player.id === currentDrawer;
        const hasGuessed = player.hasGuessed;
        const rank = index + 1;

        const cardStyle = {
          ...styles.card,
          ...(hasGuessed ? styles.cardGuessed : {}),
          ...(isDrawing ? styles.cardDrawing : {}),
        };

        return (
          <div key={player.id} style={cardStyle}>
            {/* Rank */}
            <span style={styles.rank}>#{rank}</span>

            {/* Name */}
            <span
              style={{
                ...styles.name,
                fontWeight: isDrawing || hasGuessed ? 700 : 400,
              }}
            >
              {player.name}
            </span>

            {/* Status indicator */}
            <span style={styles.status}>
              {isDrawing && '✏️'}
              {hasGuessed && '✅'}
            </span>

            {/* Score */}
            <span style={styles.score}>
              {player.score} <span style={styles.pts}>pts</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    overflowY: 'auto',
    padding: 4,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.3s ease',
  },
  cardGuessed: {
    border: '1px solid rgba(76,175,80,0.35)',
    background: 'rgba(76,175,80,0.08)',
  },
  cardDrawing: {
    border: '1px solid rgba(149,117,205,0.4)',
    background: 'rgba(149,117,205,0.1)',
  },
  rank: {
    fontSize: 12,
    fontWeight: 700,
    color: '#888',
    minWidth: 24,
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: '#e2e2f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'font-weight 0.3s ease',
  },
  status: {
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  score: {
    fontSize: 13,
    fontWeight: 700,
    color: '#ccc',
    whiteSpace: 'nowrap',
  },
  pts: {
    fontSize: 10,
    fontWeight: 400,
    color: '#777',
  },
};
