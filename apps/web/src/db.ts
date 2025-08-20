import Dexie, { Table } from 'dexie';
import { Player } from './types';

class TTDatabase extends Dexie {
  players!: Table<Player, string>;

  constructor() {
    super('tt-tracker');
    this.version(1).stores({
      players: 'id, name'
    });
  }
}

export const db = new TTDatabase();
