
export enum GameStatus {
  AUTH = 'AUTH',
  LOBBY = 'LOBBY',
  CATEGORY_SELECT = 'CATEGORY_SELECT',
  REVEALING = 'REVEALING',
  PLAYING = 'PLAYING',
  WAITING_FOR_HOST = 'WAITING_FOR_HOST',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS',
  PROFILE = 'PROFILE'
}

export enum GameMode {
  LOCAL = 'LOCAL',
  ONLINE = 'ONLINE'
}

export interface User {
  id: string;
  username: string;
  email: string;
  wins: number;
  losses: number;
  friends: Friend[];
}

export interface Friend {
  id: string;
  username: string;
}

export interface Player {
  id: string; // Player ID (unique identifier)
  name: string;
  isImposter: boolean;
  word: string;
  userId?: string; // Link to user account if logged in
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface GameSettings {
  playerCount: number;
  imposterCount: number;
  playerNames: string[];
  mode: GameMode;
  roomCode?: string;
  isHost?: boolean;
  roundTime: number; // in minutes
}

export interface WordPair {
  target: string;
  decoy: string;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}
