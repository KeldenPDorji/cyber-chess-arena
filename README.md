# ♟️ Cyber Chess Arena

<div align="center">

**A modern, real-time multiplayer chess platform built with React and Supabase**

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## ✨ Features

### 🎮 Core Gameplay
- **Full Chess Implementation** - Complete chess rules including castling, en passant, and pawn promotion
- **Real-Time Multiplayer** - Instant move synchronization using Supabase Realtime
- **Smart Reconnection** - Automatic reconnection after page refresh with preserved game state
- **Legal Move Validation** - Client-side move validation with visual indicators

### 🌐 Multiplayer Experience
- **Quick Join** - Instantly join open games with one click
- **Game Invitations** - Share game links to invite friends
- **Copy Link** - One-click game link copying with clipboard API and fallback
- **Player Tracking** - Real-time player presence and connection status

### ⚡ Advanced Features
- **Draw System** - Offer and accept/decline draw proposals with opponent name display
- **Pawn Promotion** - Interactive dialog to choose promotion piece (Queen, Rook, Bishop, Knight)
- **Move History** - Complete move log with algebraic notation
- **Game Status** - Live game state updates (waiting, in progress, completed)
- **Turn Indicators** - Clear visual feedback for whose turn it is

### 🎨 User Interface
- **Responsive Design** - Optimized for desktop and mobile devices
- **Modern UI** - Beautiful components built with shadcn/ui and Radix UI
- **Neon Aesthetic** - Cyberpunk-inspired design with glowing effects
- **Smooth Animations** - Polished transitions and interactions

---

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://reactjs.org/)** - Modern UI library with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible UI components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time capabilities
- **Supabase Realtime** - WebSocket-based live data synchronization
- **PostgreSQL** - Reliable relational database with JSONB support

### Additional Libraries
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[chess.js](https://github.com/jhlywa/chess.js)** - Chess logic and validation
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cyber-chess-arena.git
   cd cyber-chess-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   Create a new Supabase project at [supabase.com](https://supabase.com)
   
   Run the migration in the Supabase SQL Editor:
   ```bash
   # Copy the contents of supabase/migrations/20260112133522_e5668940-601f-4565-b41c-a812c79787aa.sql
   # Paste and run in Supabase SQL Editor
   ```
   
   Then run the second migration:
   ```bash
   # Copy the contents of supabase/migrations/20260112140000_add_draw_and_timer.sql
   # Paste and run in Supabase SQL Editor
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Get your credentials from: Supabase Dashboard → Settings → API

5. **Enable Realtime**
   
   In your Supabase Dashboard:
   - Navigate to Database → Replication
   - Enable replication for the `games` table
   - Turn on all events (INSERT, UPDATE, DELETE)

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📖 Usage

### Creating a Game

1. Click **"Create Game"** on the home page
2. Enter your player name
3. Share the generated game link with your opponent
4. Or wait for someone to join via **Quick Join**

### Joining a Game

**Option 1: Game Link**
- Receive a game link from a friend
- Click the link to automatically join

**Option 2: Quick Join**
- Click **"Quick Join"** on the home page
- Enter your player name
- Instantly join an open game

### Playing

- **Make Moves** - Click a piece, then click a valid square
- **Offer Draw** - Click "Offer Draw" button during your turn
- **Accept/Decline Draw** - Respond to opponent's draw offer
- **Pawn Promotion** - Select your desired piece when promoting a pawn
- **View History** - Check the move history panel for all moves

### Game States

- **🟡 Waiting** - Waiting for opponent to join
- **🟢 In Progress** - Game is active
- **🔵 Completed** - Game finished (checkmate, stalemate, or draw)

---

## 🏗️ Architecture

### Project Structure

```
cyber-chess-arena/
├── src/
│   ├── components/
│   │   ├── chess/           # Chess-specific components
│   │   │   ├── ChessBoard.tsx
│   │   │   ├── ChessPiece.tsx
│   │   │   ├── ChessSquare.tsx
│   │   │   ├── GameControls.tsx
│   │   │   ├── GameLobby.tsx
│   │   │   ├── GameStatus.tsx
│   │   │   ├── MoveHistory.tsx
│   │   │   ├── PlayerInfo.tsx
│   │   │   ├── PromotionDialog.tsx
│   │   │   ├── QuickJoin.tsx
│   │   │   └── TimerSettings.tsx
│   │   ├── ui/              # Reusable UI components
│   │   └── NavLink.tsx
│   ├── hooks/
│   │   ├── useChessGame.ts          # Chess logic hook
│   │   ├── useMultiplayerGame.ts    # Multiplayer & Realtime hook
│   │   └── use-toast.ts
│   ├── integrations/
│   │   └── supabase/        # Supabase client & types
│   ├── pages/
│   │   ├── Game.tsx         # Game page
│   │   ├── Index.tsx        # Home page
│   │   └── NotFound.tsx
│   └── lib/
│       └── utils.ts         # Utility functions
├── supabase/
│   ├── migrations/          # Database migrations
│   └── config.toml
└── public/                  # Static assets
```

### Key Hooks

#### `useMultiplayerGame`
Manages multiplayer game state, real-time synchronization, and player interactions:
- Game creation and joining
- Realtime move synchronization
- Draw offer system
- Player reconnection
- QuickJoin logic

#### `useChessGame`
Handles chess game logic and validation:
- Move validation
- Check/checkmate detection
- Game state management
- Move history
- Pawn promotion

### Database Schema

**games** table:
```sql
- id (uuid)
- game_code (text) - Unique 6-character code
- player_white_name (text)
- player_black_name (text)
- current_turn (text) - 'w' or 'b'
- fen (text) - Board state
- status (text) - 'waiting' | 'in_progress' | 'completed'
- winner (text) - 'white' | 'black' | 'draw' | null
- move_history (jsonb)
- draw_offered_by (text) - 'white' | 'black' | null
- created_at (timestamp)
- last_move_at (timestamp)
```

---

## 🔐 Security

- **Environment Variables** - Sensitive keys stored in `.env` (never committed)
- **Row Level Security** - Supabase RLS policies for data protection
- **Client-Side Validation** - Move validation prevents illegal moves
- **Realtime Security** - Supabase authentication for WebSocket connections

---

## 🎯 Future Enhancements

- [ ] Timer/Clock system for timed games
- [ ] ELO rating system
- [ ] Player profiles and statistics
- [ ] Chat system during games
- [ ] Game replay functionality
- [ ] Tournament mode
- [ ] AI opponent option
- [ ] Mobile app (React Native)
- [ ] Game analysis and hints
- [ ] Custom board themes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **[chess.js](https://github.com/jhlywa/chess.js)** - Chess move validation
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[Lucide](https://lucide.dev/)** - Icon library

---

<div align="center">

**Built with ❤️ using React and Supabase**

