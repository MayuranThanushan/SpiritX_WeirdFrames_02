import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Trophy, Users, UserSquare2, Wallet, Crown, MessageSquare, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/admin', icon: Trophy },
    { name: 'Players', href: '/admin/players', icon: Users },
    { name: 'Stats', href: '/admin/stats', icon: UserSquare2 },
    { name: 'Tournament', href: '/admin/tournament', icon: Crown },
  ] : [
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Team', href: '/team', icon: UserSquare2 },
    { name: 'Budget', href: '/budget', icon: Wallet },
    { name: 'Leaderboard', href: '/leaderboard', icon: Crown },
    { name: 'Spiriter', href: '/spiriter', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h1 className="text-2xl font-bold text-indigo-600">Spirit11</h1>
            </div>
            <nav className="flex-1 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 ${
                    location.pathname === item.href ? 'bg-indigo-50 text-indigo-600' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 w-full"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;