# ♟️ Cyber Chess Arena

<div align="center">

**A modern, real-time multiplayer chess platform built with React and Supabase**

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Snyk Security](https://img.shields.io/badge/Snyk-Protected-4c4a73?logo=snyk)](https://snyk.io/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Scripts](#-available-scripts) • [Usage](#-usage) • [Architecture](#-architecture) • [Security](#-security)

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
- **Spectator Mode** - Watch live games in real-time without interfering
- **Real-Time Spectator Count** - See how many people are watching with instant updates
- **Chat System** - Real-time in-game chat between players with live typing indicators
- **Game Invitations** - Share game links to invite friends
- **Copy Link** - One-click game link copying with clipboard API and fallback
- **Player Tracking** - Real-time player presence and connection status

### ⚡ Advanced Features
- **Timer System** - Configurable time controls (1+0, 3+0, 3+2, 5+0, 5+3, 10+0, 15+10, 30+0)
- **Draw System** - Offer and accept/decline draw proposals with opponent name display
- **Victory Animations** - Celebratory confetti and dynamic effects when you win
- **Pawn Promotion** - Interactive dialog to choose promotion piece (Queen, Rook, Bishop, Knight)
- **Move History** - Complete move log with algebraic notation
- **Game Status** - Live game state updates (waiting, in progress, completed)
- **Turn Indicators** - Clear visual feedback for whose turn it is

### 🎨 User Interface
- **Responsive Design** - Optimized for desktop and mobile devices
- **Modern UI** - Beautiful components built with shadcn/ui and Radix UI
- **Neon Aesthetic** - Cyberpunk-inspired design with glowing effects
- **Smooth Animations** - Polished transitions and interactions
- **Real-Time Updates** - Instant UI updates for spectators and game state changes

### 🔒 Security & Validation
- **Input Validation** - Comprehensive validation for all user inputs (names, codes, messages)
- **Row Level Security** - Supabase RLS policies protect all database operations
- **Spectator Isolation** - Spectators cannot access player-only features (controls, chat)
- **Rate Limiting Ready** - Architecture supports future rate limiting implementation
- **Environment Security** - All secrets secured in environment variables
- **Snyk Security Scanning** - Continuous monitoring for vulnerabilities with zero known issues
- **Dependency Protection** - Automated vulnerability detection and fixes

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
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations and transitions
- **[canvas-confetti](https://github.com/catdad/canvas-confetti)** - Victory celebration effects

### Security & Monitoring
- **[Snyk](https://snyk.io/)** - Vulnerability scanning and dependency monitoring
- **GitHub Security** - Automated security advisories

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
   
   Then run the additional migrations:
   ```bash
   # Copy and run in order:
   # 1. supabase/migrations/20260112140000_add_draw_and_timer.sql
   # 2. supabase/migrations/20260113000000_add_chat_messages.sql
   # 3. supabase/migrations/20260113010000_add_spectators.sql
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
   - Enable replication for these tables:
     - `chess_games` (all events: INSERT, UPDATE, DELETE)
     - `chat_messages` (all events: INSERT, UPDATE, DELETE)
     - `game_spectators` (all events: INSERT, UPDATE, DELETE)

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173`

### 🛡️ Security Setup (Optional but Recommended)

**Snyk Security Scanning** is already configured! Run vulnerability scans anytime:

```bash
# Test for vulnerabilities
npm run snyk:test

# Monitor project on Snyk dashboard
npm run snyk:monitor

# Interactive fix wizard
npm run snyk:wizard
```

**Note:** Snyk requires authentication. Run `snyk auth` if you haven't already.

---

## 📦 Available Scripts

### Development
```bash
npm run dev          # Start development server on http://localhost:5173
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build locally
npm run lint         # Run ESLint to check code quality
```

### Security
```bash
npm run snyk:test    # Scan for security vulnerabilities
npm run snyk:monitor # Upload snapshot to Snyk dashboard
npm run snyk:wizard  # Interactive security fix wizard
```

---

## 📖 Usage

### Creating a Game

1. Click **"Create Game"** on the home page
2. Enter your player name (2-50 characters)
3. Select your preferred time control (optional)
4. Choose your preferred color (White, Black, or Random)
5. Share the generated game code or link with your opponent
6. Or wait for someone to join via **Quick Join**

### Joining a Game

**Option 1: Game Code**
- Enter the 6-character game code
- Enter your player name
- Click **"Join"** to start playing

**Option 2: Game Link**
- Receive a game link from a friend
- Click the link to automatically join

**Option 3: Quick Join**
- Click **"Quick Join"** on the home page
- Enter your player name
- Instantly join an available open game

### Spectating a Game

1. Join a game that already has 2 players
2. Enter your spectator name
3. Watch the game live with real-time updates
4. See how many other spectators are watching
5. Spectators cannot chat or control the game

### Playing

- **Make Moves** - Click a piece, then click a valid square to move
- **Chat** - Send messages to your opponent in real-time (players only)
- **Offer Draw** - Click "Offer Draw" button during your turn
- **Accept/Decline Draw** - Respond to opponent's draw offer
- **Pawn Promotion** - Select your desired piece when promoting a pawn
- **View History** - Check the move history panel for all moves
- **Watch Timer** - Keep an eye on your remaining time (if enabled)

### Victory & Game End

- **Checkmate** - Winner gets celebratory confetti animation 🎉
- **Draw** - Both players see draw notification
- **Stalemate** - Game ends in a draw
- **Time Out** - Lose if your time runs out

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
│   │   │   ├── GameChat.tsx
│   │   │   ├── GameControls.tsx
│   │   │   ├── GameLobby.tsx
│   │   │   ├── GameStatus.tsx
│   │   │   ├── MoveHistory.tsx
│   │   │   ├── PlayerInfo.tsx
│   │   │   ├── PromotionDialog.tsx
│   │   │   ├── QuickJoin.tsx
│   │   │   ├── SpectatorIndicator.tsx
│   │   │   ├── TimerSettings.tsx
│   │   │   └── VictoryAnimation.tsx
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
│   ├── lib/
│   │   ├── devLog.ts        # Development logging utility
│   │   └── utils.ts         # Utility functions
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

**chess_games** table:
```sql
- id (uuid, primary key)
- game_code (text, unique) - 6-character game code
- player_white_name (text)
- player_black_name (text)
- current_turn (text) - 'w' or 'b'
- fen (text) - Board state in FEN notation
- status (text) - 'waiting' | 'in_progress' | 'completed'
- winner (text) - 'white' | 'black' | 'draw' | null
- move_history (jsonb) - Array of moves
- draw_offered_by (text) - 'white' | 'black' | null
- white_time_left (integer) - Seconds remaining for white
- black_time_left (integer) - Seconds remaining for black
- time_control_minutes (integer) - Initial time in minutes
- time_control_increment (integer) - Increment in seconds
- created_at (timestamp)
- last_move_at (timestamp)
```

**chat_messages** table:
```sql
- id (uuid, primary key)
- game_id (uuid, foreign key → chess_games.id)
- player_color (text) - 'white' | 'black'
- player_name (text)
- message (text, max 500 characters)
- created_at (timestamp)
```

**game_spectators** table:
```sql
- id (uuid, primary key)
- game_id (uuid, foreign key → chess_games.id)
- spectator_name (text)
- joined_at (timestamp)
- last_seen_at (timestamp)
```

---

## 🔐 Security

### Application Security
- **Environment Variables** - All sensitive keys stored in `.env` (never committed to git)
- **Row Level Security (RLS)** - Comprehensive Supabase RLS policies on all tables:
  - `chess_games` - Public read, controlled write
  - `chat_messages` - Players can only insert their own messages
  - `game_spectators` - Public read for spectator counts
- **Input Validation** - All user inputs validated (names: 2-50 chars, messages: max 500 chars, codes: 6 chars)
- **Client-Side Validation** - Move validation prevents illegal chess moves
- **Spectator Isolation** - Spectators cannot access player-only features (chat, controls, toasts)
- **Real-time Security** - Supabase authentication for WebSocket connections
- **Development Logging** - All console logs disabled in production via `devLog` utility

### Dependency Security
- **Snyk Monitoring** - Continuous vulnerability scanning of all dependencies
- **Automated Alerts** - Email notifications for new security issues
- **Zero Known Vulnerabilities** - All dependencies regularly updated and tested
- **Security Dashboard** - [View project security status](https://app.snyk.io/org/keldenpdorji/projects)

### Security Scanning

Run security checks before deploying:

```bash
# Scan for vulnerabilities
npm run snyk:test

# Check specific packages
snyk test --severity-threshold=high

# Generate security report
snyk test --json > security-report.json
```

For complete security documentation, see [SNYK-SETUP-GUIDE.md](./SNYK-SETUP-GUIDE.md)

---

## 🎯 Future Enhancements

- [ ] ELO rating system and leaderboards
- [ ] Player profiles and game statistics
- [ ] Tournament mode with brackets
- [ ] AI opponent with difficulty levels
- [ ] Game replay and analysis features
- [ ] Custom board themes and piece sets
- [ ] Mobile app (React Native)
- [ ] Profanity filter for chat
- [ ] Rate limiting for API requests
- [ ] Email notifications for game invites
- [ ] Puzzle mode for training
- [ ] Opening book and move suggestions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **Code Quality** - Follow TypeScript best practices
- **Security** - Run `npm run snyk:test` before submitting PRs
- **Testing** - Ensure all features work as expected
- **Documentation** - Update README for new features

---

## 🙏 Acknowledgments

- **[chess.js](https://github.com/jhlywa/chess.js)** - Chess move validation
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[Lucide](https://lucide.dev/)** - Icon library

---

<div align="center">

**Built with ❤️ using React and Supabase**

