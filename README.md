<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Imposter - Social Mystery Game

A multiplayer social deduction game where players must identify the imposter among them. Built with React, TypeScript, Supabase, and Vercel.

## Features

- 🎮 **Multiplayer Support**: Play with friends using 4-digit room codes
- 🔄 **Real-time Sync**: Powered by Supabase real-time subscriptions
- 🎯 **Multiple Categories**: Choose from various word categories or use AI-generated themes
- 🎤 **Voice Chat**: Optional voice communication during gameplay
- 📊 **Player Stats**: Track your wins and losses
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Prerequisites

- Node.js (v18 or higher)
- A Supabase account (free tier works)
- (Optional) Gemini API key for AI-generated categories

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL migration from `supabase/migrations/001_initial_schema.sql`
4. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key  # Optional, for AI Surprise category
```

### 4. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (optional)
4. Deploy!

### Option 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

## How to Play

1. **Create or Join a Room**:
   - Host: Click "HOST OPS" and share your 4-digit room code
   - Join: Click "JOIN OPS" and enter the room code

2. **Select Category**: Choose a word category or use AI Surprise

3. **Gameplay**:
   - Most players get the same word
   - The imposter gets a different word
   - Players take turns describing their word
   - Try to identify the imposter!

4. **Voting**: After discussion, vote out who you think is the imposter

5. **Results**: See if you caught the imposter!

## Project Structure

```
├── components/          # React components
│   ├── AuthView.tsx
│   ├── CategoryView.tsx
│   ├── GameView.tsx
│   ├── LobbyView.tsx
│   ├── ProfileView.tsx
│   ├── ResultsView.tsx
│   ├── RevealView.tsx
│   └── VotingView.tsx
├── services/           # Service modules
│   ├── geminiService.ts
│   └── supabaseService.ts
├── supabase/           # Database migrations
│   └── migrations/
│       └── 001_initial_schema.sql
├── App.tsx             # Main app component
├── types.ts            # TypeScript type definitions
├── constants.ts        # Game constants and categories
└── vercel.json         # Vercel deployment config
```

## Database Schema

The app uses Supabase with the following main tables:

- **rooms**: Stores game rooms with status, players, and settings
- **room_players**: Tracks players in each room
- **room_chats**: Stores chat messages for real-time communication
- **room_votes**: Records voting during the game

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Supabase** - Backend and real-time database
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling (via CDN)
- **Google Gemini AI** - AI-generated word pairs

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
