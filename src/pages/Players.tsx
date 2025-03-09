import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Player } from '../types';
import { Search, Filter } from 'lucide-react';

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Batsman' | 'Bowler' | 'All-Rounder'>('all');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'players'));
        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || player.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Players</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{player.name}</h3>
            <p className="text-gray-600 mb-4">{player.university}</p>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {player.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlayer(player);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Stats
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPlayer.name}</h2>
                <p className="text-gray-600">{selectedPlayer.university}</p>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Batting Stats</h3>
                <div className="space-y-2">
                  <p className="text-gray-900">Runs: {selectedPlayer.stats.totalRuns}</p>
                  <p className="text-gray-900">Strike Rate: {selectedPlayer.stats.battingStrikeRate.toFixed(2)}</p>
                  <p className="text-gray-900">Average: {selectedPlayer.stats.battingAverage.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bowling Stats</h3>
                <div className="space-y-2">
                  <p className="text-gray-900">Wickets: {selectedPlayer.stats.wickets}</p>
                  <p className="text-gray-900">Economy: {selectedPlayer.stats.economyRate.toFixed(2)}</p>
                  <p className="text-gray-900">Strike Rate: {selectedPlayer.stats.bowlingStrikeRate.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Player Value</p>
                  <p className="text-xl font-semibold text-gray-900">
                    Rs. {selectedPlayer.stats.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;