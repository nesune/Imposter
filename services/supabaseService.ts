
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player, Category, WordPair, GameSettings, ChatMessage } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file');
  console.error('Current values:', { 
    url: supabaseUrl ? '✓ Set' : '✗ Missing', 
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing' 
  });
} else {
  console.log('✓ Supabase credentials found');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Test Supabase connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('rooms').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✓ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Database Types
export interface Room {
  id: string;
  code: string;
  host_id: string;
  host_name: string;
  status: 'waiting' | 'category_select' | 'revealing' | 'playing' | 'voting' | 'results';
  category?: Category;
  word_pair?: WordPair;
  players: Player[];
  settings: {
    imposter_count: number;
    round_time: number;
  };
  created_at: string;
  updated_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  is_host: boolean;
  is_imposter?: boolean;
  word?: string;
  user_id?: string;
  joined_at: string;
}

export interface RoomChat {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  text: string;
  timestamp: number;
  created_at: string;
}

export interface RoomVote {
  id: string;
  room_id: string;
  voter_id: string;
  voted_player_id: string;
  created_at: string;
}

// Room Management
export const createRoom = async (code: string, hostId: string, hostName: string, settings: GameSettings): Promise<string | null> => {
  try {
    // Ensure code is uppercase and 4 digits
    const normalizedCode = code.toUpperCase().padStart(4, '0').slice(0, 4);
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code: normalizedCode,
        host_id: hostId,
        host_name: hostName,
        status: 'waiting',
        players: [],
        settings: {
          imposter_count: settings.imposterCount,
          round_time: settings.roundTime,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating room:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('Room created successfully:', { id: data.id, code: normalizedCode });
    return data.id;
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
};

export const getRoomByCode = async (code: string): Promise<Room | null> => {
  try {
    // Normalize code to uppercase for consistent lookup
    const normalizedCode = code.toUpperCase().padStart(4, '0').slice(0, 4);
    console.log('Looking up room with code:', normalizedCode);
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (error) {
      console.error('Error getting room:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // If room not found, return null (don't throw)
      if (error.code === 'PGRST116') {
        console.log('Room not found with code:', normalizedCode);
        return null;
      }
      throw error;
    }
    
    console.log('Room found:', { id: data.id, code: data.code, status: data.status });
    return data as Room;
  } catch (error) {
    console.error('Error getting room:', error);
    return null;
  }
};

export const updateRoom = async (roomId: string, updates: Partial<Room>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating room:', error);
    return false;
  }
};

export const deleteRoom = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting room:', error);
    return false;
  }
};

// Player Management
export const addPlayerToRoom = async (
  roomId: string,
  playerId: string,
  playerName: string,
  isHost: boolean,
  userId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('room_players')
      .insert({
        room_id: roomId,
        player_id: playerId,
        player_name: playerName,
        is_host: isHost,
        user_id: userId,
      });

    if (error) throw error;

    // Update room players array
    const room = await getRoomById(roomId);
    if (room) {
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isImposter: false,
        word: '',
        userId,
      };
      const updatedPlayers = [...room.players, newPlayer];
      await updateRoom(roomId, { players: updatedPlayers });
    }

    return true;
  } catch (error) {
    console.error('Error adding player:', error);
    return false;
  }
};

export const removePlayerFromRoom = async (roomId: string, playerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('player_id', playerId);

    if (error) throw error;

    // Update room players array
    const room = await getRoomById(roomId);
    if (room) {
      const updatedPlayers = room.players.filter(p => p.id !== playerId);
      await updateRoom(roomId, { players: updatedPlayers });
    }

    return true;
  } catch (error) {
    console.error('Error removing player:', error);
    return false;
  }
};

export const getRoomById = async (roomId: string): Promise<Room | null> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data as Room;
  } catch (error) {
    console.error('Error getting room by id:', error);
    return null;
  }
};

export const getPlayersInRoom = async (roomId: string): Promise<RoomPlayer[]> => {
  try {
    const { data, error } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data as RoomPlayer[];
  } catch (error) {
    console.error('Error getting players:', error);
    return [];
  }
};

// Chat Management
export const sendChatMessage = async (
  roomId: string,
  playerId: string,
  playerName: string,
  text: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('room_chats')
      .insert({
        room_id: roomId,
        player_id: playerId,
        player_name: playerName,
        text,
        timestamp: Date.now(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending chat:', error);
    return false;
  }
};

export const getChatHistory = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('room_chats')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return (data || []).map(msg => ({
      playerId: msg.player_id,
      playerName: msg.player_name,
      text: msg.text,
      timestamp: msg.timestamp,
    }));
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Voting Management
export const submitVote = async (
  roomId: string,
  voterId: string,
  votedPlayerId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('room_votes')
      .insert({
        room_id: roomId,
        voter_id: voterId,
        voted_player_id: votedPlayerId,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error submitting vote:', error);
    return false;
  }
};

export const getVotes = async (roomId: string): Promise<RoomVote[]> => {
  try {
    const { data, error } = await supabase
      .from('room_votes')
      .select('*')
      .eq('room_id', roomId);

    if (error) throw error;
    return data as RoomVote[];
  } catch (error) {
    console.error('Error getting votes:', error);
    return [];
  }
};

export const clearVotes = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('room_votes')
      .delete()
      .eq('room_id', roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing votes:', error);
    return false;
  }
};

// Generate unique 4-digit room code
export const generateRoomCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Check if room code exists
export const checkRoomCodeExists = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    return !!data;
  } catch (error) {
    console.error('Error checking room code:', error);
    return false;
  }
};

// Generate unique room code that doesn't exist
export const generateUniqueRoomCode = async (): Promise<string> => {
  let code = generateRoomCode();
  let exists = await checkRoomCodeExists(code);
  let attempts = 0;
  
  while (exists && attempts < 10) {
    code = generateRoomCode();
    exists = await checkRoomCodeExists(code);
    attempts++;
  }
  
  // Ensure uppercase
  return code.toUpperCase();
};
