# Cyber Chess Arena

A cyberpunk-themed multiplayer chess game with neon aesthetics.

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- Chess.js

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd cyber-chess-arena

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- Real-time multiplayer chess gameplay
- Cyberpunk-themed UI with neon aesthetics
- Move history and game status tracking
- Player information display
- Chess timers with customizable time controls
- Draw offers, resignation, and timeout detection
- Color selection (play as White, Black, or Random)
- Quick Join links for easy game sharing
- Responsive design for mobile and desktop

## Troubleshooting

### Draw Offer Not Working?
If clicking "Offer Draw" doesn't work, you need to apply a database migration.

**Quick Fix:** See [QUICK_FIX_DRAW_OFFER.md](./QUICK_FIX_DRAW_OFFER.md) (2 minutes)

**Detailed Guide:** See [DEBUG_DRAW_OFFER.md](./DEBUG_DRAW_OFFER.md)

**Diagnostic Tool:** Open `/draw-diagnostic.html` in your browser

### Other Issues
- **Blank Screen:** See [BLANK_SCREEN_FIX.md](./BLANK_SCREEN_FIX.md)
- **Real-time Issues:** See [REALTIME_FIXES.md](./REALTIME_FIXES.md)
- **General Status:** See [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## Documentation

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Feature improvements and enhancements
- [WINNER_DISPLAY_AND_DRAW_SYSTEM.md](./WINNER_DISPLAY_AND_DRAW_SYSTEM.md) - Game ending logic
- [QUICK_JOIN_FEATURE.md](./QUICK_JOIN_FEATURE.md) - Quick join implementation
- [FIX_DRAW_OFFER.md](./FIX_DRAW_OFFER.md) - Draw offer system details

# cyber-chess-arena
