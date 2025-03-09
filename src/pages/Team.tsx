import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Player, User } from '../types';
import { Users, AlertCircle } from 'lucide-react';

const Team = () => {
  const [user, setUser] = useState<User | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Batsman' | 'Bowler' | 'All-Rounder' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPlayers = async () => {
      try {
        if (!auth.currentUser) return;

        // Fetch user data
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('id', '==', auth.currentUser.uid)
        ));
        
        if (!userDoc.empty) {
          setUser(userDoc.docs[0].data() as User);
        }

        // Fetch all players
        const playersSnapshot = await getDocs(collection(db, 'players'));
        const players = playersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];
        
        setAvailablePlayers(players);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPlayers();
  }, []);

  const addPlayerToTeam = async (player: Player) => {
    if (!user || !auth.currentUser) return;

    // Check if player is already in team
    if (user.team.some(p => p.id === player.id)) {
      alert('This player is already in your team!');
      return;
    }

    // Check if team is full
    if (user.team.length >= 11) {
      alert('Your team is already full!');
      return;
    }

    // Check if user has enough budget
    if (user.budget < player.stats.value) {
      alert('You don\'t have enough budget for this player!');
      return;
    }

    try {
      const newTeam = [...user.team, player];
      const newBudget = user.budget - player.stats.value;

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        team: newTeam,
        budget: newBudget
      });

      setUser({
        ...user,
        team: newTeam,
        budget: newBudget
      });
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player to team');
    }
  };

  const removePlayerFromTeam = async (player: Player) => {
    if (!user || !auth.currentUser) return;

    try {
      const newTeam = user.team.filter(p => p.id !== player.id);
      const newBudget = user.budget + player.stats.value;

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        team: newTeam,
        budget: newBudget
      });

      setUser({
        ...user,
        team: newTeam,
        budget: newBudget
      });
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player from team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Error Loading User Data</h2>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  const filteredPlayers = selectedCategory
    ? availablePlayers.filter(p => p.category === selectedCategory)
    : availablePlayers;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Build Your Team</h1>
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-6">
          <div>
            <p className="text-gray-600">Team Size</p>
            <p className="text-2xl font-bold text-indigo-600">{user.team.length}/11</p>
          </div>
          <div>
            <p className="text-gray-600">Available Budget</p>
            <p className="text-2xl font-bold text-green-600">Rs. {user.budget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Team */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold">Your Team</h2>
            </div>
            
            {user.team.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No players selected yet</p>
            ) : (
              <div className="space-y-4">
                {user.team.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">{player.category}</p>
                    </div>
                    <button
                      onClick={() => removePlayerFromTeam(player)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Player Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Select Players</h2>
              <div className="flex space-x-4">
                {(['Batsman', 'Bowler', 'All-Rounder'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                    className={`px-4 py-2 rounded-lg ${
                      category === selectedCategory
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}s
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-500">{player.university}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {player.category}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-indigo-600 font-medium">
                      Rs. {player.stats.value.toLocaleString()}
                    </p>
                    <button
                      onClick={() => addPlayerToTeam(player)}
                      disabled={user.team.some(p => p.id === player.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {user.team.some(p => p.id === player.id) ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;