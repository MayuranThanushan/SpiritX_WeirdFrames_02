export interface Player {
  id: string;
  name: string;
  university: string;
  category: 'Batsman' | 'Bowler' | 'All-Rounder';
  stats: {
    totalRuns: number;
    ballsFaced: number;
    inningsPlayed: number;
    wickets: number;
    oversBowled: number;
    runsConceded: number;
    // Calculated stats
    battingStrikeRate: number;
    battingAverage: number;
    bowlingStrikeRate: number;
    economyRate: number;
    points: number;
    value: number;
  };
}

export interface User {
  id: string;
  username: string;
  budget: number;
  team: Player[];
  totalPoints: number;
  createdAt: string;
}

export interface PlayerData {
  name: string;
  university: string;
  category: string;
  totalRuns: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
}

export const calculatePlayerStats = (player: PlayerData) => {
  const battingStrikeRate = (player.totalRuns / player.ballsFaced) * 100 || 0;
  const battingAverage = player.totalRuns / player.inningsPlayed || 0;
  const bowlingStrikeRate = (player.oversBowled * 6) / player.wickets || 0;
  const economyRate = (player.runsConceded / (player.oversBowled * 6)) * 6 || 0;

  // Calculate points according to the formula
  const points = 
    ((battingStrikeRate / 5) + (battingAverage * 0.8)) + 
    ((500 / bowlingStrikeRate) + (140 / economyRate)) || 0;

  // Calculate value (rounded to nearest 50,000)
  const rawValue = (9 * points + 100) * 1000;
  const value = Math.round(rawValue / 50000) * 50000;

  return {
    battingStrikeRate,
    battingAverage,
    bowlingStrikeRate,
    economyRate,
    points,
    value
  };
};