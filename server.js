import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { wordCategories, getRandomWords } from './words.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve built frontend assets if they exist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  res.send('Server is running');
});

// Wildcard routing to serve React index.html for SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(200).send('ScribbleShowdown server is running (Frontend not built)');
    }
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function clearRoomInterval(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

function broadcastRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const playersData = room.players.map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    hasGuessed: p.hasGuessed,
    isHost: p.isHost
  }));

  const stateToSend = {
    code: room.code,
    players: playersData,
    category: room.category,
    maxRounds: room.maxRounds,
    currentRound: room.currentRound,
    drawerIndex: room.drawerIndex,
    currentDrawer: room.currentDrawer,
    gameState: room.gameState,
    timer: room.timer,
    wordChoices: room.wordChoices,
    wordHint: room.currentWord ? room.currentWord.replace(/[a-zA-Z0-9]/g, '_ ') : ''
  };

  room.players.forEach(player => {
    const socket = io.sockets.sockets.get(player.id);
    if (socket) {
      if (player.id === room.currentDrawer && room.gameState === 'PLAYING') {
        socket.emit('roomStateUpdate', { ...stateToSend, currentWord: room.currentWord });
      } else if (room.gameState === 'ROUND_OVER' || room.gameState === 'GAME_OVER') {
        socket.emit('roomStateUpdate', { ...stateToSend, currentWord: room.currentWord });
      } else {
        socket.emit('roomStateUpdate', stateToSend);
      }
    }
  });
}

function startWordSelection(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  clearRoomInterval(room);
  room.gameState = 'SELECTING_WORD';
  room.drawHistory = [];
  
  const drawer = room.players[room.drawerIndex];
  room.currentDrawer = drawer.id;
  room.players.forEach(p => p.hasGuessed = false);

  room.wordChoices = getRandomWords(room.category, 3);
  room.currentWord = '';

  room.timer = 15;
  broadcastRoomState(roomCode);

  room.timerInterval = setInterval(() => {
    room.timer--;
    if (room.timer <= 0) {
      selectWord(roomCode, room.wordChoices[0]);
    } else {
      io.to(roomCode).emit('timerTick', room.timer);
    }
  }, 1000);
}

function selectWord(roomCode, word) {
  const room = rooms.get(roomCode);
  if (!room || room.gameState !== 'SELECTING_WORD') return;

  clearRoomInterval(room);
  room.currentWord = word;
  room.wordChoices = [];
  room.gameState = 'PLAYING';
  room.timer = 60;

  io.to(roomCode).emit('clearCanvas');
  broadcastRoomState(roomCode);

  io.to(roomCode).emit('chatMessage', {
    sender: 'System',
    text: `Round ${room.currentRound}: ${room.players.find(p => p.id === room.currentDrawer).name} is drawing!`,
    isSystem: true
  });

  room.timerInterval = setInterval(() => {
    room.timer--;
    if (room.timer <= 0) {
      endRound(roomCode, false);
    } else {
      io.to(roomCode).emit('timerTick', room.timer);
    }
  }, 1000);
}

function endRound(roomCode, allGuessed = false) {
  const room = rooms.get(roomCode);
  if (!room) return;

  clearRoomInterval(room);
  room.gameState = 'ROUND_OVER';

  io.to(roomCode).emit('chatMessage', {
    sender: 'System',
    text: `Round over! The word was: "${room.currentWord}"`,
    isSystem: true
  });

  broadcastRoomState(roomCode);

  setTimeout(() => {
    room.drawerIndex++;
    if (room.drawerIndex >= room.players.length) {
      room.drawerIndex = 0;
      room.currentRound++;
    }

    if (room.currentRound > room.maxRounds || room.players.length < 2) {
      room.gameState = 'GAME_OVER';
      io.to(roomCode).emit('chatMessage', {
        sender: 'System',
        text: `Game Over! Check out the final scoreboard.`,
        isSystem: true
      });
      broadcastRoomState(roomCode);
    } else {
      startWordSelection(roomCode);
    }
  }, 5000);
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', ({ playerName, category, maxRounds }) => {
    let roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const newRoom = {
      code: roomCode,
      players: [{
        id: socket.id,
        name: playerName,
        score: 0,
        hasGuessed: false,
        isHost: true
      }],
      category: category || 'Animals',
      maxRounds: maxRounds || 3,
      currentRound: 1,
      drawerIndex: 0,
      currentDrawer: null,
      currentWord: '',
      wordChoices: [],
      gameState: 'LOBBY',
      timer: 0,
      timerInterval: null,
      drawHistory: []
    };

    rooms.set(roomCode, newRoom);
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    broadcastRoomState(roomCode);
  });

  socket.on('joinRoom', ({ playerName, roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('joinError', 'Room does not exist!');
      return;
    }

    if (room.gameState !== 'LOBBY') {
      socket.emit('joinError', 'Game has already started!');
      return;
    }

    if (room.players.length >= 8) {
      socket.emit('joinError', 'Room is full (max 8 players)!');
      return;
    }

    const playerObj = {
      id: socket.id,
      name: playerName,
      score: 0,
      hasGuessed: false,
      isHost: false
    };

    room.players.push(playerObj);
    socket.join(roomCode);
    
    io.to(roomCode).emit('chatMessage', {
      sender: 'System',
      text: `${playerName} has joined the room!`,
      isSystem: true
    });

    socket.emit('drawHistory', room.drawHistory);
    broadcastRoomState(roomCode);
  });

  socket.on('startGame', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'LOBBY') return;
    
    if (room.players.length < 2) {
      socket.emit('gameError', 'Need at least 2 players to start!');
      return;
    }

    room.currentRound = 1;
    room.drawerIndex = 0;
    startWordSelection(roomCode);
  });

  socket.on('selectWord', ({ roomCode, word }) => {
    selectWord(roomCode, word);
  });

  socket.on('draw', ({ roomCode, drawData }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'PLAYING' || room.currentDrawer !== socket.id) return;

    room.drawHistory.push(drawData);
    socket.to(roomCode).emit('draw', drawData);
  });

  socket.on('clearCanvas', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'PLAYING' || room.currentDrawer !== socket.id) return;

    room.drawHistory = [];
    io.to(roomCode).emit('clearCanvas');
  });

  socket.on('undo', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'PLAYING' || room.currentDrawer !== socket.id) return;

    if (room.drawHistory.length > 0) {
      let popped = [];
      do {
        popped.push(room.drawHistory.pop());
      } while (room.drawHistory.length > 0 && popped[popped.length - 1].type !== 'start');
      
      io.to(roomCode).emit('clearCanvas');
      io.to(roomCode).emit('drawHistory', room.drawHistory);
    }
  });

  socket.on('sendMessage', ({ roomCode, message }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (room.gameState === 'PLAYING' && socket.id !== room.currentDrawer && !player.hasGuessed) {
      const cleanGuess = message.trim().toLowerCase();
      const cleanWord = room.currentWord.toLowerCase();

      if (cleanGuess === cleanWord) {
        player.hasGuessed = true;
        const points = 100 + (room.timer * 2);
        player.score += points;

        const drawer = room.players.find(p => p.id === room.currentDrawer);
        if (drawer) {
          drawer.score += 30;
        }

        io.to(roomCode).emit('chatMessage', {
          sender: 'System',
          text: `${player.name} guessed the word correctly! (+${points} pts)`,
          isSystem: true,
          isCorrect: true
        });

        io.to(roomCode).emit('playEffect', 'correct');
        broadcastRoomState(roomCode);

        const guessers = room.players.filter(p => p.id !== room.currentDrawer);
        const allCorrect = guessers.every(p => p.hasGuessed);
        if (allCorrect) {
          endRound(roomCode, true);
        }
        return;
      }
    }

    io.to(roomCode).emit('chatMessage', {
      sender: player.name,
      text: message,
      isSystem: false
    });
  });

  socket.on('sendReaction', ({ roomCode, emoji }) => {
    io.to(roomCode).emit('receiveReaction', { playerId: socket.id, emoji });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        io.to(roomCode).emit('chatMessage', {
          sender: 'System',
          text: `${player.name} has left the room.`,
          isSystem: true
        });

        if (room.players.length === 0) {
          clearRoomInterval(room);
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted as it became empty.`);
          break;
        }

        if (player.isHost && room.players.length > 0) {
          room.players[0].isHost = true;
          io.to(roomCode).emit('chatMessage', {
            sender: 'System',
            text: `${room.players[0].name} is now the host!`,
            isSystem: true
          });
        }

        if (room.gameState !== 'LOBBY' && room.gameState !== 'GAME_OVER') {
          if (room.players.length < 2) {
            clearRoomInterval(room);
            room.gameState = 'GAME_OVER';
            io.to(roomCode).emit('chatMessage', {
              sender: 'System',
              text: `Not enough players to continue! Game Over.`,
              isSystem: true
            });
            broadcastRoomState(roomCode);
          } else {
            if (room.currentDrawer === socket.id) {
              io.to(roomCode).emit('chatMessage', {
                sender: 'System',
                text: `The drawer left the game! Moving to next turn.`,
                isSystem: true
              });
              room.drawerIndex = room.drawerIndex % room.players.length;
              startWordSelection(roomCode);
            } else {
              if (room.drawerIndex >= room.players.length) {
                room.drawerIndex = 0;
              }
              const guessers = room.players.filter(p => p.id !== room.currentDrawer);
              if (guessers.length > 0 && guessers.every(p => p.hasGuessed)) {
                endRound(roomCode, true);
              } else {
                broadcastRoomState(roomCode);
              }
            }
          }
        } else {
          broadcastRoomState(roomCode);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
