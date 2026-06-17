# ScribbleShowdown - Draw and Guess Game

A premium, modern real-time multiplayer Draw and Guess game built with **React**, **Vite**, **Express**, and **Socket.io**. It features a dark-themed gaming UI with sleek gradient accents, smooth transitions, real-time drawing synchronization, interactive chat, and live leaderboards.

---

## 🚀 Features

- **Real-Time Canvas Synchronisation**: Draw using varying brush sizes, colors, and brush tools. Clean canvas and undo strokes on the fly.
- **Interactive Lobby System**: Start private rooms, join lobbies, and check player lists before starting the game.
- **Smart Chat & Guessing System**: Send messages to other players. Automatically filter correct guesses to avoid spoiling the answer for others, showing clues/hints as time progresses.
- **Live Leaderboard**: Real-time scoring system that awards points based on how quickly you guess the word, and rewards the painter when players guess correctly.
- **Branded Design**: Implemented with Outfit typography, custom SVG favicon, and premium CSS variables for clean maintenance.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, HTML5 Canvas API, Socket.io-client
- **Backend**: Node.js, Express, Socket.io (WebSocket)
- **Styling**: Vanilla CSS with HSL-based Custom CSS properties for dark mode gaming aesthetics
- **Development Tooling**: Concurrently (to run server and client in a single command)

---

## 📂 Project Structure

```text
draw-and-guess/
├── public/
│   └── favicon.svg         # ScribbleShowdown branded SVG icon
├── src/
│   ├── components/
│   │   ├── Canvas.jsx      # HTML5 Canvas with tools and socket synchronization
│   │   ├── Chat.jsx        # Guess input, socket message logs
│   │   ├── Game.jsx        # Active game screen structure
│   │   ├── Home.jsx        # Landing page for entering username
│   │   ├── Lobby.jsx       # Intermediary lobby room before starting
│   │   └── Scoreboard.jsx  # Player points rankings sidebar
│   ├── App.jsx             # Main app container, handles routing/game states
│   ├── index.css           # Global CSS variables & game stylesheets
│   └── main.jsx            # React mounting entrypoint
├── index.html              # Vite entrypoint
├── package.json            # Joint script configurations and dependencies
├── server.js               # Express + Socket.io backend server
├── vite.config.js          # Vite configuration with React integration
└── words.js                # Game words list generator
```

---

## 🚦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Open a terminal in the project directory:
   ```bash
   cd C:/Users/Sunnyyyy/.gemini/antigravity/scratch/draw-and-guess
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

To run both the **backend server** (port 4000) and the **Vite React dev server** (port 3000) concurrently:

```bash
npm run dev
```

Once started:
- Open your browser to **`http://localhost:3000`** to play.
- You can open multiple browser windows or tabs to simulate multiplayer matches.
