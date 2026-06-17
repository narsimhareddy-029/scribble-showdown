import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';

const SERVER_URL = `${window.location.protocol}//${window.location.hostname}:4000`;

export default function App() {
  // ── State ──────────────────────────────────────────
  const [screen, setScreen] = useState('HOME');       // 'HOME' | 'LOBBY' | 'GAME'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [socketError, setSocketError] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [socketId, setSocketId] = useState('');

  const socketRef = useRef(null);

  // ── Socket Initialisation & Listeners ──────────────
  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // Connection success
    socket.on('connect', () => {
      setSocketId(socket.id);
    });

    // Room successfully created
    socket.on('roomCreated', (code) => {
      setRoomCode(code);
      setScreen('LOBBY');
    });

    // Authoritative room state update
    socket.on('roomStateUpdate', (state) => {
      setRoomState(state);

      // Auto-switch screen based on game phase
      if (
        state.gameState === 'PLAYING' ||
        state.gameState === 'SELECTING_WORD' ||
        state.gameState === 'ROUND_OVER'
      ) {
        setScreen('GAME');
      } else if (state.gameState === 'LOBBY') {
        setScreen('LOBBY');
      }
    });

    // Chat message received
    socket.on('chatMessage', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Join / room errors
    socket.on('joinError', (message) => {
      setSocketError(message);
    });

    socket.on('gameError', (message) => {
      alert(message);
    });

    // Reaction emojis from other players
    socket.on('receiveReaction', ({ emoji }) => {
      const id = `${Date.now()}-${Math.random()}`;
      const xPos = Math.random() * 80 + 10; // 10% – 90% of viewport width

      setFloatingEmojis((prev) => [...prev, { id, emoji, x: xPos }]);

      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
      }, 2000);
    });

    // Sound effects
    socket.on('playEffect', (effect) => {
      if (effect === 'correct') {
        try {
          const ding = new Audio('/sounds/ding.mp3');
          ding.volume = 0.5;
          ding.play();
        } catch {
          // Audio play may be blocked by browser policy – fail silently
        }
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Handler Functions ──────────────────────────────

  const createRoom = useCallback(({ name, category, maxRounds }) => {
    setPlayerName(name);
    setSocketError('');
    socketRef.current?.emit('createRoom', { playerName: name, category, maxRounds });
  }, []);

  const joinRoom = useCallback(({ name, roomCode }) => {
    setPlayerName(name);
    setRoomCode(roomCode);
    setSocketError('');
    socketRef.current?.emit('joinRoom', { playerName: name, roomCode });
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('startGame', { roomCode });
  }, [roomCode]);

  const selectWord = useCallback((word) => {
    socketRef.current?.emit('selectWord', { roomCode, word });
  }, [roomCode]);

  const sendDrawing = useCallback((drawingData) => {
    socketRef.current?.emit('drawing', { roomCode, drawingData });
  }, [roomCode]);

  const clearCanvas = useCallback(() => {
    socketRef.current?.emit('clearCanvas', { roomCode });
  }, [roomCode]);

  const undoDrawing = useCallback(() => {
    socketRef.current?.emit('undoDrawing', { roomCode });
  }, [roomCode]);

  const sendMessage = useCallback((text) => {
    socketRef.current?.emit('chatMessage', {
      roomCode,
      message: text,
      playerName,
    });
  }, [roomCode, playerName]);

  const sendReaction = useCallback((emoji) => {
    socketRef.current?.emit('sendReaction', { roomCode, emoji });
  }, [roomCode]);

  // ── Render ─────────────────────────────────────────
  return (
    <div className="app-container">
      {/* Floating Emoji Layer */}
      {floatingEmojis.map(({ id, emoji, x }) => (
        <span
          key={id}
          className="floating-emoji"
          style={{ left: `${x}%` }}
        >
          {emoji}
        </span>
      ))}

      {/* Screen Router */}
      {screen === 'HOME' && (
        <Home
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          error={socketError}
        />
      )}

      {screen === 'LOBBY' && roomState ? (
        <Lobby
          roomState={roomState}
          socketId={socketId}
          onStartGame={startGame}
        />
      ) : screen === 'LOBBY' ? (
        <div className="glass-panel lobby-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Entering room...</p>
        </div>
      ) : null}

      {screen === 'GAME' && roomState ? (
        <Game
          roomState={roomState}
          socketId={socketId}
          chatMessages={chatMessages}
          floatingEmojis={floatingEmojis}
          onSelectWord={selectWord}
          onSendDrawing={sendDrawing}
          onClearCanvas={clearCanvas}
          onUndoDrawing={undoDrawing}
          onSendMessage={sendMessage}
          onSendReaction={sendReaction}
          socket={socketRef.current}
        />
      ) : screen === 'GAME' ? (
        <div className="glass-panel game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading game...</p>
        </div>
      ) : null}
    </div>
  );
}
