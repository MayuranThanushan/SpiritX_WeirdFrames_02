import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';

const Budget = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) return;

        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('id', '==', auth.currentUser.uid)
        ));
        
        if (!userDoc.empty) {
          setUser(userDoc.docs[0].data() as User);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        <h2 className="text-2xl font-bold text-gray-900">Error Loading Budget Data</h2>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  const initialBudget = 9000000;
  const spentBudget = initialBudget - user.budget;
  const spentPercentage = (spentBudget / initialBudget) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Budget Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Wallet className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Available Budget</h2>
          </div>
          <p className="text-3xl font-bold text-green-600">
            Rs. {user.budget.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingDown className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Spent Budget</h2>
          </div>
          <p className="text-3xl font-bold text-red-600">
            Rs. {spentBudget.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Initial Budget</h2>
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            Rs. {initialBudget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Utilization</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${spentPercentage}%` }}
          ></div>
        </div>
        <p className="text-gray-600">
          You have spent {spentPercentage.toFixed(1)}% of your budget
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Player Expenses</h2>
        {user.team.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No players in your team yet</p>
        ) : (
          <div className="space-y-4">
            {user.team.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-500">{player.category}</p>
                </div>
                <p className="font-medium text-indigo-600">
                  Rs. {player.stats.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;