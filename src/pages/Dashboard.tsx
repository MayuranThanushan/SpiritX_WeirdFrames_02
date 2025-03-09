import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Browse Players',
      description: 'View detailed statistics and information about all players in the tournament.',
      icon: Users,
      action: () => navigate('/players'),
    },
    {
      title: 'Build Your Team',
      description: 'Select players and create your dream team within your budget.',
      icon: Trophy,
      action: () => navigate('/team'),
    },
    {
      title: 'Get AI Assistance',
      description: 'Chat with Spiriter AI to get insights and recommendations for your team.',
      icon: MessageSquare,
      action: () => navigate('/spiriter'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Spirit11
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Build your ultimate Inter-University Cricket fantasy team!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer transform transition-all hover:scale-105"
            onClick={feature.action}
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl font-bold mb-2">1</div>
            <h3 className="text-xl font-semibold mb-2">Select Players</h3>
            <p>Browse through the available players and their statistics.</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">2</div>
            <h3 className="text-xl font-semibold mb-2">Build Team</h3>
            <p>Create your team within the budget of Rs.9,000,000.</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">3</div>
            <h3 className="text-xl font-semibold mb-2">Compete</h3>
            <p>Score points based on your players' performance and climb the leaderboard!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;