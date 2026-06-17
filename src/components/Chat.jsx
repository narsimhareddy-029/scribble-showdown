import React, { useState, useEffect, useRef } from 'react';

export default function Chat({ messages, onSendMessage, isDrawer, gameState, players, socketId }) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const hasGuessedCorrectly = players.some(
    (p) => p.id === socketId && p.hasGuessed
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isDisabled =
    gameState !== 'PLAYING' || isDrawer || hasGuessedCorrectly;

  const placeholderText = isDrawer
    ? 'You are drawing! No guessing.'
    : hasGuessedCorrectly
      ? 'You got it! Shhh...'
      : 'Type your guess...';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isDisabled) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>💬 Game Chat</span>
        <span style={styles.headerHint}>guesses are secret!</span>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={styles.messages}>
        {messages.map((msg, i) => {
          const isSystem = msg.type === 'system' || msg.isSystem;
          const isCorrect = msg.type === 'correct' || msg.isCorrect;

          return (
            <div
              key={i}
              className={`chat-msg${isSystem ? ' system' : ''}${isCorrect ? ' correct' : ''}`}
              style={{
                ...styles.msg,
                ...(isSystem ? styles.systemMsg : {}),
                ...(isCorrect ? styles.correctMsg : {}),
              }}
            >
              {isSystem ? (
                <span style={styles.systemText}>{msg.text}</span>
              ) : (
                <>
                  <span style={styles.senderName}>{msg.sender}</span>
                  <span>{msg.text}</span>
                </>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input-wrapper" style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholderText}
          maxLength={40}
          disabled={isDisabled}
          style={{
            ...styles.input,
            ...(isDisabled ? styles.inputDisabled : {}),
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isDisabled}
          style={{
            ...styles.sendBtn,
            ...(!inputText.trim() || isDisabled ? styles.sendBtnDisabled : {}),
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#1e1e2e',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#e2e2f0',
  },
  headerHint: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  msg: {
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  systemMsg: {
    background: 'rgba(255,255,255,0.03)',
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
  systemText: {},
  correctMsg: {
    background: 'rgba(76,175,80,0.12)',
    border: '1px solid rgba(76,175,80,0.25)',
    color: '#81c784',
    textAlign: 'center',
    fontWeight: 600,
  },
  senderName: {
    fontWeight: 700,
    color: '#f48fb1',
    marginRight: 6,
  },
  form: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e2e2f0',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  inputDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  sendBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#7c4dff',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease, background 0.2s ease',
  },
  sendBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};
