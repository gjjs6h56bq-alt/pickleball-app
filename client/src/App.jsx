import React, { useState } from 'react';
import { Search, LogOut, User, Lock, Loader } from 'lucide-react';

// --- CONFIGURATION ---
// 1. FOR LOCAL PREVIEW: (Comment this out now)
// const API_BASE = 'http://localhost:5000';

// 2. FOR RAILWAY DEPLOYMENT: (Uncomment this!)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Could not connect to server.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setPlayers([]);
    setSearchQuery('');
  };

  const searchPlayers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setPlayers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/players?search=${query}`);
      const data = await res.json();
      setPlayers(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Pickleball Organiser</h1>
            <p className="text-slate-500 text-sm">Please sign in to manage sessions</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center border border-red-100">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-slate-400">Demo User:</p>
            <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">admin@club.com / password123</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 text-white p-1.5 rounded-md font-bold text-lg">PO</div>
           <span className="font-bold text-xl hidden sm:block">Session Organiser</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
          <LogOut size={18} /> Sign Out
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Find Players</h2>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name (e.g., 'John')"
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              value={searchQuery}
              onChange={(e) => searchPlayers(e.target.value)}
            />
            {loading && <div className="absolute right-4 top-3.5 animate-spin text-blue-500"><Loader size={20} /></div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.length > 0 ? (
            players.map((player) => (
              <div key={player.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{player.name}</h3>
                  <p className="text-slate-500 text-sm">{player.email}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold">DUPR</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-sm">
                    {player.dupr_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            searchQuery.length > 1 && !loading && (
              <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                No players found matching "{searchQuery}"
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}