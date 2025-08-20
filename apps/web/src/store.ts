import { create } from 'zustand';
import { db } from './db';
import { Player } from './types';
import { nanoid } from 'nanoid';

interface Store {
  players: Player[];
  load: () => Promise<void>;
  addPlayer: (name: string) => Promise<void>;
}

export const useStore = create<Store>((set) => ({
  players: [],
  load: async () => {
    const players = await db.players.toArray();
    set({ players });
  },
  addPlayer: async (name: string) => {
    const player: Player = {
      id: nanoid(),
      name,
      ratingElo: 1000,
      createdAt: new Date()
    };
    await db.players.add(player);
    set((state) => ({ players: [...state.players, player] }));
  }
}));
