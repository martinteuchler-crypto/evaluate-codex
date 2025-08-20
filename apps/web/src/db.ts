import Dexie, { Table } from 'dexie';
import { Player, Team, Match, Tournament } from './types';

class TTDatabase extends Dexie {
  players!: Table<Player, string>;
  teams!: Table<Team, string>;
  matches!: Table<Match, string>;
  tournaments!: Table<Tournament, string>;

  constructor() {
    super('tt-tracker');
    this.version(2).stores({
      players: 'id, name',
      teams: 'id, name',
      matches: 'id',
      tournaments: 'id, name'
    });
  }
}

export const db = new TTDatabase();
