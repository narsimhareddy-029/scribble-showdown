import React from 'react';
import Canvas from './Canvas';
import Chat from './Chat';
import Scoreboard from './Scoreboard';

export default function Game({
  roomState,
  socketId,
  chatMessages,
  floatingEmojis,
  onSelectWord,
  onSendDrawing,
  onClearCanvas,
  onUndoDrawing,
  onSendMessage,
  onSendReaction,
  socket,
}) {
  const {
    code,
    players,
    category,
    currentRound,
    maxRounds,
    currentDrawer,
    gameState,
    timer,
    wordChoices,
    currentWord,
    wordHint,
  } = roomState;

  const isDrawer = socketId === currentDrawer;
  const drawerPlayer = players.find((p) => p.id === currentDrawer);
  const drawerName = drawerPlayer ? drawerPlayer.name : '';

  const REACTION_EMOJIS = ['😂', '😮', '👏', '🎨', '❓', '🔥'];

  /* ── Game-Over overlay ─────────────────────────────────── */
  if (gameState === 'GAME_OVER') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <div className="game-over-overlay">
        <div className="glass-panel game-over-card">
          <h1 className="game-over-title">🏆 Final Results 🏆</h1>

          <ul className="game-over-list">
            {sorted.map((player, idx) => (
              <li key={player.id} className="game-over-player">
                <span className="game-over-medal">
                  {medals[idx] || `#${idx + 1}`}
                </span>
                <span className="game-over-name">{player.name}</span>
                <span className="game-over-score">{player.score}</span>
              </li>
            ))}
          </ul>

          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Back to Main Screen
          </button>
        </div>
      </div>
    );
  }

  /* ── Main game layout ──────────────────────────────────── */
  return (
    <div className="game-container">
      {/* LEFT COLUMN */}
      <div className="glass-panel game-sidebar-left">
        <div className="room-info">
          <p className="room-code">
            Room: <strong>{code}</strong>
          </p>
          <p className="room-category">
            Category: <strong>{category}</strong>
          </p>
          <p className="room-round">
            Round: <strong>{currentRound}</strong> / {maxRounds}
          </p>
        </div>

        <Scoreboard
          players={players}
          currentDrawer={currentDrawer}
          socketId={socketId}
        />
      </div>

      {/* CENTER COLUMN */}
      <div className="canvas-wrapper glass-panel">
        {/* Header */}
        <div className="canvas-header">
          <span className={`timer-badge${timer <= 15 ? ' timer-flash' : ''}`}>
            ⏱ {timer}s
          </span>

          <div className="word-display">
            {gameState === 'PLAYING' && isDrawer && (
              <span className="word-actual">{currentWord}</span>
            )}
            {gameState === 'PLAYING' && !isDrawer && wordHint && (
              <span className="word-hint">{wordHint}</span>
            )}
            {gameState === 'SELECTING_WORD' && (
              <span className="state-label">
                {isDrawer
                  ? 'Pick a word to draw!'
                  : `${drawerName} is choosing a word…`}
              </span>
            )}
            {gameState === 'ROUND_OVER' && (
              <span className="state-label">
                The word was: <strong>{currentWord}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div className="canvas-area">
          {/* Word-selection overlay */}
          {gameState === 'SELECTING_WORD' && (
            <div className="word-selection-overlay">
              {isDrawer ? (
                <div className="word-choices">
                  {wordChoices &&
                    wordChoices.map((word) => (
                      <button
                        key={word}
                        className="btn btn-word"
                        onClick={() => onSelectWord(word)}
                      >
                        {word}
                      </button>
                    ))}
                </div>
              ) : (
                <div className="spinner" />
              )}
            </div>
          )}

          {/* Floating emojis */}
          {floatingEmojis.map((fe) => (
            <span
              key={fe.id}
              className="floating-emoji"
              style={{ left: `${fe.x}%` }}
            >
              {fe.emoji}
            </span>
          ))}

          <Canvas
            isDrawer={gameState === 'PLAYING' && isDrawer}
            onSendDrawing={onSendDrawing}
            onClearCanvas={onClearCanvas}
            onUndoDrawing={onUndoDrawing}
            socket={socket}
          />
        </div>

        {/* Reactions */}
        <div className="reactions-panel">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="btn-reaction"
              onClick={() => onSendReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="glass-panel game-sidebar-right">
        <Chat
          messages={chatMessages}
          onSendMessage={onSendMessage}
          isDrawer={isDrawer}
          gameState={gameState}
          players={players}
          socketId={socketId}
        />
      </div>
    </div>
  );
}
